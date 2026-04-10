import { Router } from "express";
import Prisma from "../configs/prismaClient";
import CodeSubmissionRepository from "../repositories/codeSubmission.repository";
import CodeSubmissionService from "../services/codeSubmission.service";
import CodeSubmissionController from "../controllers/codeSubmission.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/role.middleware";
import { Permissions } from "../constants/roles";

const codeSubmissionRepository = new CodeSubmissionRepository(
  Prisma,
  "submissionId"
);
const codeSubmissionService = new CodeSubmissionService(
  codeSubmissionRepository
);
const codeSubmissionController = new CodeSubmissionController(
  codeSubmissionService
);

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission([Permissions.COURSE_READ]),
  (req, res, next) =>
    codeSubmissionController.getAllCodeSubmission(req, res, next)
);

export default router;
