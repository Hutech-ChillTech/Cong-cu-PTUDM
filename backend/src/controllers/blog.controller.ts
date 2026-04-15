import { Request, Response } from "express";
import BlogService from "../services/blog.service";
import { BlogStatus } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";

class BlogController {
  private blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  getAllPosts = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const authorId = req.query.authorId as string;
      const status = req.query.status as BlogStatus;
      const tagId = req.query.tagId as string;
      const categoryId = req.query.categoryId as string;

      const result = await this.blogService.getAllPosts(
        page,
        limit,
        search,
        authorId,
        status,
        tagId,
        categoryId
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPostById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const post = await this.blogService.getPostById(id);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getPostBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await this.blogService.getPostBySlug(slug);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  createPost = async (req: AuthRequest, res: Response) => {
    try {
      // Use userId from AuthRequest (set by authenticate middleware)
      const authorId = req.user?.userId || req.body.authorId;
      
      if (!authorId) {
        return res.status(401).json({ message: "Unauthorized: Missing author ID. Please login." });
      }

      // Validate required fields
      const { title, content } = req.body;
      if (!title || !content) {
        console.error("Validation Error: Missing required fields", { title: !!title, content: !!content });
        return res.status(400).json({ 
          message: "Missing required fields", 
          errors: {
            title: !title ? "Title is required" : undefined,
            content: !content ? "Content is required" : undefined
          }
        });
      }

      // Auto-generate slug if not provided
      let slug = req.body.slug;
      if (!slug) {
        // Simple slug generation: lowercase, replace spaces with hyphens
        slug = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove consecutive hyphens
          .trim();
      }

      const postData = {
        ...req.body,
        slug,
        authorId,
      };
      
      console.log("Creating blog post with data:", {
        title: postData.title,
        slug: postData.slug,
        status: postData.status,
        authorId: postData.authorId,
        tagIds: postData.tagIds,
        categoryIds: postData.categoryIds
      });
      
      const newPost = await this.blogService.createPost(postData);
      res.status(201).json(newPost);
    } catch (error: any) {
      console.error("Create Blog Error:", error);
      console.error("Error stack:", error.stack);
      
      // Check for Prisma-specific errors
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          message: "A blog post with this slug already exists",
          field: error.meta?.target?.[0] || 'slug'
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(400).json({ 
          message: "Referenced tag or category not found",
          details: error.meta
        });
      }
      
      res.status(400).json({ 
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  updatePost = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedPost = await this.blogService.updatePost(id, updateData);
      res.status(200).json(updatedPost);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deletePost = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.blogService.deletePost(id);
      res.status(200).json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getFeaturedPosts = async (req: Request, res: Response) => {
    try {
        const posts = await this.blogService.getFeaturedPosts();
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }
}

export default BlogController;
