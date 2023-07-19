import { StacksTransaction } from '@stacks/transactions';
import { validateTransaction } from '../src/validation';

describe('validateTransaction', () => {
  test('returns true for STX -> DIKO alex swap transaction', async () => {
    const expected = true;
    const input = {
      payload: {
        contractAddress: {
          hash160: 'e685b016b3b6cd9ebf35f38e5ae29392e2acd51d',
          type: 0,
          version: 22,
        },
        contractName: {
          content: 'amm-swap-pool-v1-1',
          lengthPrefixBytes: 1,
          maxLengthBytes: 128,
          type: 2,
        },
        functionName: {
          content: 'swap-helper-a',
          lengthPrefixBytes: 1,
          maxLengthBytes: 128,
          type: 2,
        },
        payloadType: 2,
        type: 8,
      },
    } as StacksTransaction;
    const received = await validateTransaction(input);
    expect(received).toEqual(expected);
  });
  test('throws error for a random transaction', async () => {
    const input = {
      payload: {
        contractAddress: {
          hash160: 'e685b016b3b6cd9ebf35f38e5ae29392e2acd51d',
          type: 0,
          version: 22,
        },
        contractName: {
          content: 'not-an-alex-contract',
          lengthPrefixBytes: 1,
          maxLengthBytes: 128,
          type: 2,
        },
        functionName: {
          content: 'swap-helper-a',
          lengthPrefixBytes: 1,
          maxLengthBytes: 128,
          type: 2,
        },
        payloadType: 2,
        type: 8,
      },
    } as StacksTransaction;
    expect(() => validateTransaction(input)).rejects.toThrow('Transaction is not an ALEX swap contract address');
  });
});
