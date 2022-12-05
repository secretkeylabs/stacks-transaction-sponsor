import { Controller } from "./controller";

const express = require("express");
const router = express.Router();
const controller = new Controller();

router.get("/info", controller.info);
router.post("/sponsor", controller.sponsor);

export = router;
