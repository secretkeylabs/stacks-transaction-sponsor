//mocking the use of env variables, even if .env file changes, it won't affect tests
jest.mock("../config/config", () => {
  return {
    seed: "xxx",
    password: "xxx",
    numAddresses: 3,
    maxFee: 10,
  };
});

jest.mock("@stacks/transactions", () => {
  return Object.assign(
    {},
    {
      ...jest.requireActual("@stacks/transactions"),
      callReadOnlyFunction: jest.fn(),
    }
  );
});
