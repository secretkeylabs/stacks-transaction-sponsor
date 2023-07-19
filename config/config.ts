import * as dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

//will check and return envVar if required env variable is present in .env file
function isEnvVarValid(envVar: string) {
  if (envVar === undefined || null) {
    throw new Error(
      "Incorrect env variable format! Compare with .env.example."
    );
  }
  return envVar;
}

export default {
  seed: isEnvVarValid(
    process.env.SEED as string
  ),
  password: isEnvVarValid(
    process.env.PASSWORD as string
  ),
  numAddresses: isEnvVarValid(
    process.env.NUM_ADDRESSES as string
  ),
  maxFee: isEnvVarValid(
    process.env.MAX_FEE as string
  ),
};
