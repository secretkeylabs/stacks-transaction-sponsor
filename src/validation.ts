import { PayloadType, ContractCallPayload, addressToString, StacksTransaction } from '@stacks/transactions';

// rules for transaction sponsorship eligibility
// customize this if you are forking this repo
export async function validateTransaction(transaction: StacksTransaction): Promise<boolean> {
  if (transaction.payload.payloadType !== PayloadType.ContractCall) {
    throw new Error('Transaction is not a contract call');
  }

  const payload = transaction.payload as ContractCallPayload;
  const contractAddress = addressToString(payload.contractAddress);

  if (contractAddress !== 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9') {
    throw new Error('Transaction is not an ALEX swap contract address');
  }

  return true;
}
