import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import envVariables from '../config/config';
import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { SponsorAccountsKey } from './constants';
import cache from './cache';
import { fetchAndCacheAccountNonce } from './nonce';

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
    const newAccounts = generateNewAccount(wallet);
    wallet.accounts = newAccounts.accounts;
  }

  // cache sponsor accounts
  cache.instance().set(SponsorAccountsKey, wallet.accounts);

  // get the correct next nonce for each addresses
  wallet.accounts.forEach((account) => {
    const address = getAddressFromPrivateKey(account.stxPrivateKey, TransactionVersion.Mainnet);
    fetchAndCacheAccountNonce(address);
  });
}
