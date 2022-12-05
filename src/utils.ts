import { Account } from '@stacks/wallet-sdk';
import { 
  getAddressFromPrivateKey,
  TransactionVersion
} from "@stacks/transactions";

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getAccountAddress(
  account: Account, 
  version: TransactionVersion = TransactionVersion.Mainnet 
): string {
  return getAddressFromPrivateKey(account.stxPrivateKey, version);
}