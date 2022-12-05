## Stacks Transaction Sponsor Web Service

This is a web service that functions as a open sponsor for Stacks transactions. This allows users to send transactions for free, without owning any STX tokens in their wallet.

POST to the `/v1/sponsor` endpoint with the user signed transaction in the JSON body. The transaction must be created as a sponsored transaction. The service will sign the transaction as the sponsor and broadcast it.

The service will use multiple addresses from the same wallet at random to sponsor transactions. You can set the number of addresses to use in the `.env` file. Each addresses must be funded with STX. This allows the sponsor to handle more simultaneous pending transactions.

`/v1/info` will return the list of addresses used by the service for sponsoring transactions

**NOTE: Rules are currently set so that only NFT transfer transaction will be sponsored. You can modify the rules for your own use if you are forking.**

## Requirements

* [Node Js](https://nodejs.org/en/download)

## Setup Instructions

Clone the repo and install the dependencies.
```bash
npm install
```
Create an `.env` file in the project root using the included `.env.example` file as a guide.

Configure the .env file with your wallet seed phrase. 


## Running

To start the server, run the following

```bash
npm run build
```
```bash
npm run start
```
To run in development mode
```bash
npm run dev 
```
To run tests
```
npm run test
```

