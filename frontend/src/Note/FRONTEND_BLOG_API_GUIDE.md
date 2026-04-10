# 📘 Frontend Developer Guide - Blog, Tag & Category API

> **Tài liệu đầy đủ cho Frontend Developer** để tích hợp Blog System với Tag và Category Management.

---

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [Tag API](#tag-api)
5. [Category API](#category-api)
6. [Blog Post API](#blog-post-api)
7. [Common Patterns](#common-patterns)
8. [Error Handling](#error-handling)
9. [Example Components](#example-components)
10. [Best Practices](#best-practices)

---

## 🌐 API Overview

### Base URLs
```typescript
const API_BASE_URL = 'http://localhost:3000/api';

const ENDPOINTS = {
  tags: `${API_BASE_URL}/tags`,
  categories: `${API_BASE_URL}/categories`,
  blogPosts: `${API_BASE_URL}/blog-posts`,
  auth: `${API_BASE_URL}/users/login`,
};
```

### HTTP Methods
- `GET`: Lấy dữ liệu (Public/Protected)
- `POST`: Tạo mới (Protected - cần token)
- `PUT`: Cập nhật (Protected - cần token)
- `DELETE`: Xóa (Protected - cần token)

---

## 🔐 Authentication

### Login & Get Token
```typescript
// Login API
const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/users/login`, {
    email,
    password
  });
  
  const { accessToken } = response.data;
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
};
```

### Axios Instance with Auth
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 📦 TypeScript Interfaces

### Tag Types
```typescript
export enum TagType {
  COURSE = 'COURSE',
  BLOG = 'BLOG',
  GENERAL = 'GENERAL'
}

export interface Tag {
  tagId: string;
  name: string;
  slug: string;
  description?: string;
  type: TagType;
  created_at: string;
  updated_at: string;
}

export interface CreateTagDto {
  name: string;
  description?: string;
  type: TagType;
}

export interface UpdateTagDto {
  name?: string;
  description?: string;
  type?: TagType;
}
```

### Category Types
```typescript
export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  orderIndex: number;
  created_at: string;
  updated_at: string;
  
  // Relations (khi include)
  parent?: Category;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  orderIndex?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: string;
  orderIndex?: number;
}
```

### Blog Post Types
```typescript
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED'
}

export interface Author {
  userId: string;
  userName: string;
  email: string;
  avatarURL?: string;
}

export interface BlogPost {
  blogPostId: string;
  
  // Content
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Status
  status: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;
  
  // Stats
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  readingTime?: number;
  
  // Author
  authorId: string;
  author?: Author;
  
  // Featured
  isFeatured: boolean;
  isPinned: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  categories?: Array<{
    category: Category;
  }>;
  tags?: Array<{
    tag: Tag;
  }>;
}

export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: string;
  scheduledAt?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  readingTime?: number;
  tagIds?: string[];
  categoryIds?: string[];
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: string;
  scheduledAt?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  readingTime?: number;
  tagIds?: string[];
  categoryIds?: string[];
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🏷️ Tag API

### Service Functions

```typescript
// src/services/tag.service.ts
import api from './api';
import { Tag, CreateTagDto, UpdateTagDto, TagType } from '../types/tag';

export const tagService = {
  // Get all tags
  getAllTags: async (type?: TagType): Promise<Tag[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/tags', { params });
    return response.data.data || response.data;
  },

  // Get popular tags
  getPopularTags: async (limit = 10, type?: TagType): Promise<Tag[]> => {
    const params = { limit, ...(type && { type }) };
    const response = await api.get('/tags/popular', { params });
    return response.data.data || response.data;
  },

  // Search tags
  searchTags: async (query: string, limit = 10): Promise<Tag[]> => {
    const response = await api.get('/tags/search', {
      params: { q: query, limit }
    });
    return response.data.data || response.data;
  },

  // Get tag by ID
  getTagById: async (tagId: string): Promise<Tag> => {
    const response = await api.get(`/tags/${tagId}`);
    return response.data.data || response.data;
  },

  // Get tag by slug
  getTagBySlug: async (slug: string): Promise<Tag> => {
    const response = await api.get(`/tags/slug/${slug}`);
    return response.data.data || response.data;
  },

  // Create tag (Admin only)
  createTag: async (data: CreateTagDto): Promise<Tag> => {
    const response = await api.post('/tags', data);
    return response.data.data || response.data;
  },

  // Update tag (Admin only)
  updateTag: async (tagId: string, data: UpdateTagDto): Promise<Tag> => {
    const response = await api.put(`/tags/${tagId}`, data);
    return response.data.data || response.data;
  },

  // Delete tag (Admin only)
  deleteTag: async (tagId: string): Promise<void> => {
    await api.delete(`/tags/${tagId}`);
  },
};
```

### React Hook Example

```typescript
// src/hooks/useTags.ts
import { useState, useEffect } from 'react';
import { tagService } from '../services/tag.service';
import { Tag, TagType } from '../types/tag';

export const useTags = (type?: TagType) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const data = await tagService.getAllTags(type);
        setTags(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [type]);

  return { tags, loading, error };
};

export const usePopularTags = (limit = 10, type?: TagType) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tagService.getPopularTags(limit, type)
      .then(setTags)
      .finally(() => setLoading(false));
  }, [limit, type]);

  return { tags, loading };
};
```

---

## 📂 Category API

### Service Functions

```typescript
// src/services/category.service.ts
import api from './api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

export const categoryService = {
  // Get all categories (flat list)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data || response.data;
  },

  // Get root categories with nested children
  getRootCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/root');
    return response.data.data || response.data;
  },

  // Get popular categories
  getPopularCategories: async (limit = 10): Promise<Category[]> => {
    const response = await api.get('/categories/popular', {
      params: { limit }
    });
    return response.data.data || response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data || response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data.data || response.data;
  },

  // Get children of a category
  getCategoryChildren: async (categoryId: string): Promise<Category[]> => {
    const response = await api.get(`/categories/${categoryId}/children`);
    return response.data.data || response.data;
  },

  // Create category (Admin only)
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.data || response.data;
  },

  // Update category (Admin only)
  updateCategory: async (categoryId: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data.data || response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
  },
};
```

### React Hook Example

```typescript
// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { categoryService } from '../services/category.service';
import { Category } from '../types/category';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
};

export const useRootCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getRootCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
};
```

---

## 📝 Blog Post API

### Service Functions

```typescript
// src/services/blog.service.ts
import api from './api';
import { 
  BlogPost, 
  CreateBlogPostDto, 
  UpdateBlogPostDto, 
  BlogPostListResponse,
  BlogStatus 
} from '../types/blog';

export const blogService = {
  // Get all blog posts with pagination
  getAllPosts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    authorId?: string;
    status?: BlogStatus;
  }): Promise<BlogPostListResponse> => {
    const response = await api.get('/blog-posts', { params });
    return response.data;
  },

  // Get featured posts
  getFeaturedPosts: async (): Promise<BlogPost[]> => {
    const response = await api.get('/blog-posts/featured');
    return response.data;
  },

  // Get post by ID
  getPostById: async (id: string): Promise<BlogPost> => {
    const response = await api.get(`/blog-posts/${id}`);
    return response.data;
  },

  // Get post by slug
  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`/blog-posts/slug/${slug}`);
    return response.data;
  },

  // Create post (Protected)
  createPost: async (data: CreateBlogPostDto): Promise<BlogPost> => {
    const response = await api.post('/blog-posts', data);
    return response.data;
  },

  // Update post (Protected)
  updatePost: async (id: string, data: UpdateBlogPostDto): Promise<BlogPost> => {
    const response = await api.put(`/blog-posts/${id}`, data);
    return response.data;
  },

  // Delete post (Protected)
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/blog-posts/${id}`);
  },
};
```

### React Hooks

```typescript
// src/hooks/useBlogPosts.ts
import { useState, useEffect } from 'react';
import { blogService } from '../services/blog.service';
import { BlogPost, BlogStatus } from '../types/blog';

export const useBlogPosts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAllPosts(params);
        setPosts(response.posts);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [params?.page, params?.limit, params?.search, params?.status]);

  return { posts, pagination, loading, error };
};

export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    blogService.getPostBySlug(slug)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { post, loading, error };
};

export const useFeaturedPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getFeaturedPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return { posts, loading };
};
```

---

## 🔄 Common Patterns

### 1. Tag/Category Selector Component

```typescript
// components/TagSelector.tsx
import React, { useState } from 'react';
import { useTags } from '../hooks/useTags';
import { Tag } from '../types/tag';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onChange 
}) => {
  const { tags, loading } = useTags();
  const [search, setSearch] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  if (loading) return <div>Loading tags...</div>;

  return (
    <div className="tag-selector">
      <input
        type="text"
        placeholder="Search tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <div className="tag-list">
        {filteredTags.map(tag => (
          <button
            key={tag.tagId}
            className={selectedTags.includes(tag.tagId) ? 'selected' : ''}
            onClick={() => toggleTag(tag.tagId)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 2. Category Tree Component

```typescript
// components/CategoryTree.tsx
import React from 'react';
import { useRootCategories } from '../hooks/useCategories';
import { Category } from '../types/category';

interface CategoryTreeProps {
  selectedCategory?: string;
  onSelect: (categoryId: string) => void;
}

const CategoryNode: React.FC<{
  category: Category;
  selected?: string;
  onSelect: (id: string) => void;
}> = ({ category, selected, onSelect }) => {
  return (
    <div className="category-node">
      <div
        className={selected === category.categoryId ? 'selected' : ''}
        onClick={() => onSelect(category.categoryId)}
      >
        {category.name}
      </div>
      
      {category.children && category.children.length > 0 && (
        <div className="category-children">
          {category.children.map(child => (
            <CategoryNode
              key={child.categoryId}
              category={child}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  selectedCategory,
  onSelect
}) => {
  const { categories, loading } = useRootCategories();

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="category-tree">
      {categories.map(category => (
        <CategoryNode
          key={category.categoryId}
          category={category}
          selected={selectedCategory}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
```

### 3. Blog Post Form

```typescript
// components/BlogPostForm.tsx
import React, { useState } from 'react';
import { blogService } from '../services/blog.service';
import { CreateBlogPostDto, BlogStatus } from '../types/blog';
import { TagSelector } from './TagSelector';
import { CategoryTree } from './CategoryTree';

export const BlogPostForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateBlogPostDto>({
    title: '',
    content: '',
    excerpt: '',
    status: BlogStatus.DRAFT,
    tagIds: [],
    categoryIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await blogService.createPost(formData);
      
      // Success - redirect or show message
      alert('Blog post created successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Excerpt</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
      </div>

      <div>
        <label>Content *</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ 
            ...formData, 
            status: e.target.value as BlogStatus 
          })}
        >
          <option value={BlogStatus.DRAFT}>Draft</option>
          <option value={BlogStatus.PUBLISHED}>Published</option>
          <option value={BlogStatus.SCHEDULED}>Scheduled</option>
        </select>
      </div>

      <div>
        <label>Tags</label>
        <TagSelector
          selectedTags={formData.tagIds || []}
          onChange={(tagIds) => setFormData({ ...formData, tagIds })}
        />
      </div>

      <div>
        <label>Categories</label>
        <CategoryTree
          selectedCategory={formData.categoryIds?.[0]}
          onSelect={(categoryId) => setFormData({ 
            ...formData, 
            categoryIds: [categoryId] 
          })}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Blog Post'}
      </button>
    </form>
  );
};
```

---

## ⚠️ Error Handling

### Error Response Format

```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string>;
  field?: string;
  details?: any;
}
```

### Common Errors

```typescript
// 400 Bad Request
{
  "message": "Missing required fields",
  "errors": {
    "title": "Title is required",
    "content": "Content is required"
  }
}

// 400 Duplicate Slug
{
  "message": "A blog post with this slug already exists",
  "field": "slug"
}

// 400 Invalid Reference
{
  "message": "Referenced tag or category not found"
}

// 401 Unauthorized
{
  "message": "Unauthorized: Missing author ID. Please login."
}

// 404 Not Found
{
  "message": "Blog post not found"
}
```

### Error Handler Utility

```typescript
// utils/errorHandler.ts
import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    
    // Validation errors
    if (data?.errors) {
      return Object.values(data.errors).join(', ');
    }
    
    // Single error message
    if (data?.message) {
      return data.message;
    }
    
    // HTTP status messages
    if (error.response?.status === 401) {
      return 'Unauthorized. Please login again.';
    }
    
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
  }
  
  return 'An unexpected error occurred.';
};

// Usage
try {
  await blogService.createPost(data);
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
}
```

---

## ✅ Best Practices

### 1. **Always Use TypeScript**
```typescript
// ✅ Good
const post: BlogPost = await blogService.getPostById(id);

// ❌ Bad
const post = await blogService.getPostById(id);
```

### 2. **Handle Loading States**
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await blogService.createPost(data);
  } finally {
    setLoading(false); // Always reset loading
  }
};
```

### 3. **Validate Before Submit**
```typescript
const validateForm = (): boolean => {
  if (!formData.title || !formData.content) {
    setError('Title and content are required');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  // ... submit
};
```

### 4. **Use Debounce for Search**
```typescript
import { useDebounce } from 'use-debounce';

const [search, setSearch] = useState('');
const [debouncedSearch] = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    tagService.searchTags(debouncedSearch).then(setTags);
  }
}, [debouncedSearch]);
```

### 5. **Cache Data When Possible**
```typescript
import { useQuery } from '@tanstack/react-query';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getAllTags(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 6. **Auto-generate Slug**
```typescript
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Usage
const handleTitleChange = (title: string) => {
  setFormData({
    ...formData,
    title,
    slug: generateSlug(title)
  });
};
```

### 7. **Optimistic Updates**
```typescript
const handleLike = async (postId: string) => {
  // Optimistic update
  setPosts(posts.map(post => 
    post.blogPostId === postId 
      ? { ...post, likeCount: post.likeCount + 1 }
      : post
  ));
  
  try {
    await blogService.likePost(postId);
  } catch (error) {
    // Rollback on error
    setPosts(posts.map(post => 
      post.blogPostId === postId 
        ? { ...post, likeCount: post.likeCount - 1 }
        : post
    ));
  }
};
```

---

## 🎯 Quick Reference

### API Endpoints Summary

| Resource | Method | Endpoint | Auth | Description |
|----------|--------|----------|------|-------------|
| **Tags** |
| | GET | `/api/tags` | No | Get all tags |
| | GET | `/api/tags/popular` | No | Get popular tags |
| | GET | `/api/tags/search?q=...` | No | Search tags |
| | GET | `/api/tags/:id` | No | Get tag by ID |
| | GET | `/api/tags/slug/:slug` | No | Get tag by slug |
| | POST | `/api/tags` | Yes | Create tag |
| | PUT | `/api/tags/:id` | Yes | Update tag |
| | DELETE | `/api/tags/:id` | Yes | Delete tag |
| **Categories** |
| | GET | `/api/categories` | No | Get all categories |
| | GET | `/api/categories/root` | No | Get root categories |
| | GET | `/api/categories/popular` | No | Get popular categories |
| | GET | `/api/categories/:id` | No | Get category by ID |
| | GET | `/api/categories/slug/:slug` | No | Get category by slug |
| | GET | `/api/categories/:id/children` | No | Get category children |
| | POST | `/api/categories` | Yes | Create category |
| | PUT | `/api/categories/:id` | Yes | Update category |
| | DELETE | `/api/categories/:id` | Yes | Delete category |
| **Blog Posts** |
| | GET | `/api/blog-posts` | No | Get all posts (paginated) |
| | GET | `/api/blog-posts/featured` | No | Get featured posts |
| | GET | `/api/blog-posts/:id` | No | Get post by ID |
| | GET | `/api/blog-posts/slug/:slug` | No | Get post by slug |
| | POST | `/api/blog-posts` | Yes | Create post |
| | PUT | `/api/blog-posts/:id` | Yes | Update post |
| | DELETE | `/api/blog-posts/:id` | Yes | Delete post |

---

## 📚 Additional Resources

- [Prisma Schema](./prisma/schema.prisma) - Database schema
- [API Documentation](./BLOG_TAG_CATEGORY_API.md) - Detailed API docs
- [Debug Guide](./DEBUG_BLOG_API.md) - Troubleshooting guide

---

## 💬 Support

Nếu gặp vấn đề:
1. Check console logs (Frontend & Backend)
2. Verify token is valid
3. Check request payload format
4. Review error response message
5. Contact backend team với đầy đủ thông tin lỗi

Good luck building! 🚀
