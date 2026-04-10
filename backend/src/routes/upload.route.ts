import { Router } from "express";
import UserService from "../services/user.service";
import LessonService from "../services/lesson.service";
import MediaController from "../controllers/media.controller";
import UserRepository from "../repositories/user.repository";
import LessonRepository from "../repositories/lesson.repository";
import Prisma from "../configs/prismaClient";
import { uploadImage, uploadVideo } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const userRepository = new UserRepository(Prisma, "userId");
const userService = new UserService(userRepository);
const lessonRepository = new LessonRepository(Prisma, "lessonId");
const lessonService = new LessonService(lessonRepository);
const mediaController = new MediaController(userService, lessonService);

const router = Router();

// Upload avatar
router.post(
  "/upload-avatar/:userId",
  authenticate,
  uploadImage.single("avatar"),
  (req, res, next) => mediaController.uploadUserAvatar(req, res, next)
);

// Upload video lên YouTube (Dành cho Admin)
router.post(
  "/video-youtube",
  authenticate,
  uploadVideo.single("video"),
  (req, res, next) => mediaController.uploadVideoToYouTube(req, res, next)
);

// Get Cloudinary signature for client-side upload
router.post("/signature", authenticate, (req, res, next) =>
  mediaController.getCloudinarySignature(req, res, next)
);

export default router;
