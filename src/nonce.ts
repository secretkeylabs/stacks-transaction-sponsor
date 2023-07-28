import { StacksMainnet } from '@stacks/network';
import { Account } from '@stacks/wallet-sdk';
import axios from 'axios';
import envVariables from '../config/config';
import { SponsorAccountsKey, AddressNoncePrefix, AddressLockPrefix, MaxLockAttempts } from './constants';
import { sleep, getRandomInt, getAccountAddress } from './utils';
import cache from './cache';

export function check(address: string): boolean {
  return cache.instance().get(AddressLockPrefix + address);
}

// lock address nonce
export function lock(address: string): boolean {
  const locked = check(address);
  if (locked === true) {
    return false;
  } else {
    cache.instance().set(AddressLockPrefix + address, true);
    return true;
  }
}

// unlock address nonce
export function unlock(address: string) {
  cache.instance().set(AddressLockPrefix + address, false);
}

export function getRandomSponsorAccount(): Account {
  const numAddresses = Number(envVariables.numAddresses);
  const randomIndex = getRandomInt(0, numAddresses - 1);
  const accounts = cache.instance().get(SponsorAccountsKey);
  return accounts[randomIndex];
}

// attempt to lock one of the available addresses
// retry after 1000ms if locked by another request
export async function lockRandomSponsorAccount(): Promise<Account> {
  let locked = false;
  let attempts = 0;

  while (!locked) {
    const account = getRandomSponsorAccount();
    const address = getAccountAddress(account);
    locked = lock(address);
    if (locked) {
      return account;
    } else {
      attempts++;
      await sleep(1000);
      if (attempts >= MaxLockAttempts) {
        throw new Error('Reached max attempts while locking sponsor address');
      }
    }
  }
}

export function unlockSponsorAccount(account: Account) {
  const address = getAccountAddress(account);
  unlock(address);
}

export function getAccountNonce(account: Account) {
  const address = getAccountAddress(account);
  const nonce = cache.instance().get(AddressNoncePrefix + address);
  return nonce;
}

export function incrementAccountNonce(account: Account) {
  const address = getAccountAddress(account);
  const currentNonce = getAccountNonce(account);
  return cache.instance().set(AddressNoncePrefix + address, currentNonce + 1);
}

export interface StxNoncesDataResponse {
  last_mempool_tx_nonce: number | null;
  last_executed_tx_nonce: number | null;
  possible_next_nonce: number;
  detected_missing_nonces: number[];
  detected_mempool_nonces?: number[];
}

export async function fetchAndCacheAccountNonce(address: string) {
  const network = new StacksMainnet();
  const apiUrl = `${network.coreApiUrl}/extended/v1/address/${address}/nonces`;

  const response = await axios.get<StxNoncesDataResponse>(apiUrl, {
    timeout: 30000,
  });
  const nextNonce = response.data.possible_next_nonce;

  return cache.instance().set(AddressNoncePrefix + address, nextNonce);
}

export async function refetchAccountNonce(account: Account) {
  const address = getAccountAddress(account);
  await fetchAndCacheAccountNonce(address);
}
