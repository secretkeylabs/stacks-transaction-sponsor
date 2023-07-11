import { PayloadType, ContractCallPayload, getAbi, addressToString, StacksTransaction } from '@stacks/transactions';

// rules for transaction sponsorship eligibility
// customize this if you are forking this repo
export async function validateTransaction(transaction: StacksTransaction): Promise<boolean> {
  if (transaction.payload.payloadType !== PayloadType.ContractCall) {
    throw new Error('Transaction is not a contract call');
  }

  const payload = transaction.payload as ContractCallPayload;

  // check and limit to SIP-09 transfers calls
  if (payload.contractAddress.hash160.toString() !== 'e685b016b3b6cd9ebf35f38e5ae29392e2acd51d') {
    throw new Error('Transaction is not an ALEX swap contract call');
  }

  const contractAddress = addressToString(payload.contractAddress);
  const contractName = payload.contractName.content.toString();
  const functionName = payload.functionName.content.toString();
  const abi = await getAbi(contractAddress, contractName, 'mainnet');
  const func = abi.functions.find((fn) => {
    return fn.name === functionName;
  });

  if (func.args.length !== 3) {
    throw new Error('Transaction is not a NFT transfer contract call');
  }

  // check against sip-09 interface for transfer
  if (func.args[0].type !== 'uint128' || func.args[1].type !== 'principal' || func.args[2].type !== 'principal') {
    throw new Error('Transaction is not a NFT transfer contract call');
  }

  return true;
}
