import { json } from 'body-parser';
import { errorHandler, wrongRouteHandler } from "./response";
import { initializeSponsorWallet } from './initialization';

let cache = require('./cache')

const express = require("express");
var cors = require('cors')
const app = express();

const v1 = require("./api/v1/router");

let port = 8080;
if (app.get("env") === "development") {
  port = 3100;
}

cache.start(function (err) {
  if (err) console.error(err)
})

// initialize the sponsor wallets to the correct nonce
initializeSponsorWallet();

app.use(json());
app.use(cors());
app.use("/v1", v1);
app.use(errorHandler);
app.use(wrongRouteHandler);

const server = app.listen(port, () => {
  console.log(
    `Stacks Transaction Sponsor Web Service started and listening at http://localhost:${port} in ${app.get(
      "env"
    )} mode`
  );
});

export default server;
