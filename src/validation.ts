import { PayloadType, ContractCallPayload, addressToString, StacksTransaction } from '@stacks/transactions';
import { AlexSDK } from 'alex-sdk';

let alex: AlexSDK;
const getAlex = () => alex ?? new AlexSDK();

// rules for transaction sponsorship eligibility
// customize this if you are forking this repo
export async function validateTransaction(transaction: StacksTransaction): Promise<boolean> {
  if (transaction.payload.payloadType !== PayloadType.ContractCall) {
    throw new Error('Transaction is not a contract call');
  }

  const payload = transaction.payload as ContractCallPayload;
  const contractAddress = addressToString(payload.contractAddress);
  const contractName = payload.contractName.content.toString();
  const functionName = payload.functionName.content.toString();

  try {
    if (!getAlex().isAlexSwapTransaction(contractAddress, contractName, functionName)) {
      throw new Error('Transaction is not an ALEX swap contract address');
    }
  } catch (e) {
    throw new Error('Transaction is not an ALEX swap contract address');
  }

  return true;
}
