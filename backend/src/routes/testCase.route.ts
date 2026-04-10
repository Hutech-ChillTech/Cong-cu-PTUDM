import { Router } from "express";
import Prisma from "../configs/prismaClient";
import TestCaseRepository from "../repositories/testcase.repository";
import TestCaseService from "../services/testCase.service";
import TestCaseController from "../controllers/testCase.controller";
import { validate } from "../middlewares/validate";
import {
  createTestCaseSchema,
  updateTestCaseSchema,
} from "../validators/testCase.validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/role.middleware";
import { Permissions } from "../constants/roles";

const testCaseRepository = new TestCaseRepository(Prisma, "testCaseId");
const testCaseService = new TestCaseService(testCaseRepository);
const testCaseController = new TestCaseController(testCaseService);

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission([Permissions.COURSE_READ]),
  (req, res, next) => testCaseController.getAllTestCases(req, res, next)
);

router.get(
  "/:testCaseId",
  authenticate,
  requirePermission([Permissions.COURSE_READ]),
  (req, res, next) => testCaseController.getTestCaseById(req, res, next)
);

router.get(
  "/lesson/:lessonId",
  // Không yêu cầu auth - cho phép xem test cases nếu lesson là preview hoặc đã enroll
  (req, res, next) => testCaseController.getTestCaseByLessonId(req, res, next)
);

router.post(
  "/",
  authenticate,
  requirePermission([Permissions.COURSE_CREATE]),
  validate(createTestCaseSchema),
  (req, res, next) => testCaseController.createTestCase(req, res, next)
);

router.put(
  "/:testCaseId",
  authenticate,
  requirePermission([Permissions.COURSE_UPDATE]),
  validate(updateTestCaseSchema),
  (req, res, next) => testCaseController.updateTestCase(req, res, next)
);

router.delete(
  "/:testCaseId",
  authenticate,
  requirePermission([Permissions.COURSE_DELETE]),
  (req, res, next) => testCaseController.deleteTestCase(req, res, next)
);

export default router;
