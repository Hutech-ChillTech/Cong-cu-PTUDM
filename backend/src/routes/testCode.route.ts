import { Router } from "express";
import TestCodeController from "../controllers/testCode.controller";
import { authenticate } from "../middlewares/auth.middleware";

const testCodeController = new TestCodeController();
const router = Router();

router.post("/run", authenticate, (req, res, next) =>
  testCodeController.runCode(req, res, next)
);

export default router;
