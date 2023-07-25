import { Controller } from './controller';
import express from 'express';

const router = express.Router();
const controller = new Controller();

router.get('/info', controller.info);
router.post('/sponsor', controller.sponsor);

export = router;
