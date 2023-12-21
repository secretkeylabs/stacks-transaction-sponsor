import { RequestHandler } from 'express';
import {
  deserializeTransaction,
  sponsorTransaction,
  broadcastTransaction,
  SponsoredAuthorization,
  StacksTransaction,
  TxRejectedReason,
} from '@stacks/transactions';
import { bytesToHex } from '@stacks/common';
import { StacksMainnet } from '@stacks/network';
import envVariables from '../../../config/config';
import { SponsorAccountsKey } from '../../constants';
import {
  lockRandomSponsorAccount,
  getAccountNonce,
  incrementAccountNonce,
  unlockSponsorAccount,
  refetchAccountNonce,
} from '../../nonce';
import { getAccountAddress } from '../../utils';
import { validateTransaction } from '../../validation';
import { Account } from '@stacks/wallet-sdk';
import cache from '../../cache';

export class Controller {
  info: RequestHandler = async (_, res, next) => {
    try {
      const accounts = cache.instance().get(SponsorAccountsKey);
      const addresses = [];
      accounts.forEach((account: Account) => {
        const address = getAccountAddress(account);
        addresses.push(address);
      });

      return res.json({
        active: true,
        sponsor_addresses: addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  sponsor: RequestHandler = async (req, res, next) => {
    try {
      const rawTx = req.body.tx;
      if (!rawTx) {
        throw new Error('Invalid request. tx is required');
      }

      let tx: StacksTransaction;
      try {
        tx = deserializeTransaction(rawTx);
      } catch (e) {
        req.logger.error(e);
        throw new Error('Failed to deserialize transaction');
      }

      // check against rules to see if transaction is allowed for sponsorship
      const validTx = await validateTransaction(tx);
      if (!validTx) {
        throw new Error('Transaction not valid for sponsorship');
      }

      // attempt to lock a random sponsor account from wallet
      const account = await lockRandomSponsorAccount();

      const signAndBroadcast = async () => {
        const network = new StacksMainnet();

        // get the sponsor address nonce
        const nonce = getAccountNonce(account);

        // sign transaction as sponsor
        let signedTx = await sponsorTransaction({
          transaction: tx,
          sponsorPrivateKey: account.stxPrivateKey,
          network,
          sponsorNonce: nonce,
        });

        // make sure fee doesn't exceed maximum
        const auth = signedTx.auth as SponsoredAuthorization;
        const fee = auth.sponsorSpendingCondition.fee;
        const maxFee = BigInt(envVariables.maxFee);
        if (fee > maxFee) {
          signedTx = await sponsorTransaction({
            transaction: tx,
            sponsorPrivateKey: account.stxPrivateKey,
            network,
            sponsorNonce: nonce,
            fee: maxFee,
          });
        }

        // broadcast transaction
        const result = await broadcastTransaction(signedTx, network);
        return {
          result,
          nonce,
          signedTx,
        };
      };

      try {
        let { result, nonce, signedTx } = await signAndBroadcast();

        // possible nonce out of sync errors
        if (
          result?.reason === TxRejectedReason.BadNonce ||
          result?.reason === ('ConflictingNonceInMempool' as TxRejectedReason)
        ) {
          req.logger.warn({ tx, nonce, result }, `${result.reason}. Will refetch cached nonce and try again`);
          await refetchAccountNonce(account);
          ({ result, nonce, signedTx } = await signAndBroadcast());
        }

        // increment nonce or handle errors
        if ('error' in result) {
          req.logger.warn(
            {
              tx,
              nonce,
              result,
            },
            'failed to broadcast transaction',
          );
          throw new Error(`Broadcast failed: ${result.error} ${result.reason}`);
        } else {
          incrementAccountNonce(account);
        }

        return res.json({ txid: result.txid, rawTx: bytesToHex(signedTx.serialize()) });
      } finally {
        unlockSponsorAccount(account);
      }
    } catch (error) {
      next(error);
    }
  };
}
