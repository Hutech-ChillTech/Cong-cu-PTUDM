import { Router } from "express";
import BlogController from "../controllers/blog.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const blogController = new BlogController();

// Public routes - ORDER MATTERS!
// Specific routes MUST come before dynamic param routes
router.get("/", blogController.getAllPosts);
router.get("/featured", blogController.getFeaturedPosts);
router.get("/slug/:slug", blogController.getPostBySlug);  // ⭐ Must be before /:id
router.get("/:id", blogController.getPostById);           // ⭐ Keep at end of GET routes

// Protected routes
router.post("/", authenticate, blogController.createPost);
router.put("/:id", authenticate, blogController.updatePost);
router.delete("/:id", authenticate, blogController.deletePost);

export default router;
