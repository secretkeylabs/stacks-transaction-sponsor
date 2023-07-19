import { json } from 'body-parser';
import { errorHandler, wrongRouteHandler } from './response';
import { initializeSponsorWallet } from './initialization';
import { Request, Response } from 'express';
import cache from './cache';
import express from 'express';
import cors from 'cors';
import v1 from './api/v1/router';
import { logger, requestLogMiddleware } from './logger';

const app = express();

let port = 8080;
if (app.get('env') === 'development') {
  port = 3100;
}

cache.start(function (err: unknown) {
  if (err) logger.error(err);
});

// initialize the sponsor wallets to the correct nonce
initializeSponsorWallet();

app.use(json());
app.use(cors());

app.get('/', (_: Request, res: Response) => {
  res.send('Ok');
});

app.use('/v1', v1);
app.use(errorHandler);
app.use(wrongRouteHandler);

const server = app.listen(port, () => {
  console.log(
    `Stacks Transaction Sponsor Web Service started and listening at http://localhost:${port} in ${app.get(
      'env',
    )} mode`,
  );
});

export default server;
