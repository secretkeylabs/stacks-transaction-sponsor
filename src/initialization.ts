import { StacksMainnet } from '@stacks/network';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import envVariables from '../config/config';
import axios from 'axios';
import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { SponsorAccountsKey, AddressNoncePrefix } from './constants';

let cache = require('./cache');

export interface StxAddressDataResponse {
  balance: string;
  locked: string;
  unlock_height: string;
  nonce: number;
}

export async function initializeSponsorWallet() {
  const seed = envVariables.seed;
  const password = envVariables.password;
  const numAddresses = Number(envVariables.numAddresses);

  // generate wallet from seed
  const wallet = await generateWallet({
    secretKey: seed,
    password: password,
  });

  // derive specified number of accounts/addresses
  for (let i = 0; i < numAddresses - 1; i++) {
    const newAccounts = await generateNewAccount(wallet);
    wallet.accounts = newAccounts.accounts;
  }

  // cache sponsor accounts
  const result = cache.instance().set(SponsorAccountsKey, wallet.accounts);

  // get the correct next nonce for each addresses
  wallet.accounts.forEach((account) => {
    const address = getAddressFromPrivateKey(account.stxPrivateKey, TransactionVersion.Mainnet);
    setupAccountNonce(address);
  });
}

export async function setupAccountNonce(address: string) {
  const network = new StacksMainnet();

  const apiUrl = `${network.coreApiUrl}/v2/accounts/${address}?proof=0`;

  // get current nonce
  const balanceInfo = await axios.get<StxAddressDataResponse>(apiUrl, {
    timeout: 30000,
  });
  const nonce = balanceInfo.data.nonce;

  // get pending transactions, increment nonce for each
  const pendingTransactionCount = await getMempoolTransactions(address);

  // calculate correct next nonce
  const nextNonce = nonce + pendingTransactionCount;

  // cache correct next nonce
  const result = cache.instance().set(AddressNoncePrefix + address, nextNonce);
}

export async function getMempoolTransactions(stxAddress: string): Promise<number> {
  const network = new StacksMainnet();
  let apiUrl = `${network.coreApiUrl}/extended/v1/tx/mempool?address=${stxAddress}`;

  return axios
    .get(apiUrl, {
      timeout: 30000,
      params: {
        limit: 0,
        offset: 30,
      },
    })
    .then((response) => {
      return response.data.total;
    });
}
