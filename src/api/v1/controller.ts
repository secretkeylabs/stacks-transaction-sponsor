import { NextFunction, Request, Response } from 'express';
import {
  deserializeTransaction,
  sponsorTransaction,
  broadcastTransaction,
  SponsoredAuthorization,
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
  check,
} from '../../nonce';
import { getAccountAddress } from '../../utils';
import { validateTransaction } from '../../validation';

let cache = require('../../cache');

export class Controller {
  info = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = cache.instance().get(SponsorAccountsKey);
      const addresses = [];
      accounts.forEach((account) => {
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

  sponsor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawTx = req.body.tx;
      const tx = deserializeTransaction(rawTx);

      // check against rules to see if transaction is allowed for sponsorship
      const validTx = await validateTransaction(tx);

      if (!validTx) {
        throw new Error('Transaction not valid for sponsorship');
      }

      // attempt to lock a random sponsor account from wallet
      const account = await lockRandomSponsorAccount();

      try {
        const network = new StacksMainnet();

        // get the sponsor address nonce
        const nonce = getAccountNonce(account);

        // sign transaction as sponsor
        const signedTx = await sponsorTransaction({
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
          throw new Error(`Transaction fee (${fee}) exceeds max sponsor fee (${maxFee})`);
        }

        // broadcast transaction
        const result = await broadcastTransaction(signedTx, network);

        // increment nonce or handle errors
        if ('error' in result) {
          throw new Error(`Broadcast failed: ${result.error}`);
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
