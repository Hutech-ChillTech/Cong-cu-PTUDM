# 🎨 FRONTEND IMPLEMENTATION - Blog & Tag System

> **Ngày cập nhật:** 07/12/2025  
> **Dựa trên:** Backend Blog & Tag System Documentation  
> **Framework:** React + TypeScript + Ant Design

---

## 📋 TỔNG QUAN

Frontend đã được cập nhật để tương thích với hệ thống **Blog & Tag** mới của backend, bao gồm:

✅ **Tag System** - Hiển thị và tìm kiếm theo tags  
✅ **Blog System** - Danh sách blog, chi tiết blog, comments  
✅ **Search System** - Tìm kiếm nâng cao theo tags, level, price  
✅ **Category System** - Phân loại blog theo danh mục  
✅ **Comment System** - Hỗ trợ comments cho cả Course và Blog  

---

## 📁 CẤU TRÚC FILES MỚI

```
src/
├── types/
│   └── blog.types.ts                    ✅ New - Types cho Blog & Tag
│
├── service/
│   ├── tag.service.ts                   ✅ New - Tag API calls
│   ├── blog.service.ts                  ✅ New - Blog API calls
│   ├── category.service.ts              ✅ New - Category API calls
│   ├── search.service.ts                ✅ New - Search API calls
│   └── comment.service.ts               ✅ Updated - Hỗ trợ blog comments
│
├── components/
│   ├── TagCloud/
│   │   ├── TagCloud.tsx                 ✅ New - Hiển thị tag cloud
│   │   └── TagCloud.css
│   │
│   └── BlogCard/
│       ├── BlogCard.tsx                 ✅ New - Card hiển thị blog
│       └── BlogCard.css
│
└── pages/
    ├── SearchPage/
    │   ├── SearchPage.tsx               ✅ New - Trang tìm kiếm
    │   └── SearchPage.css
    │
    └── BlogListPage/
        ├── BlogListPage.tsx             ✅ New - Danh sách blog
        └── BlogListPage.css
```

---

## 🔧 CÁC SERVICE ĐÃ TẠO

### 1. Tag Service (`tag.service.ts`)

**Chức năng:**
- Lấy tất cả tags
- Lấy tags phổ biến
- Tìm kiếm tags
- CRUD operations (Admin)
- Lấy IT tags

**Ví dụ sử dụng:**
```typescript
import { tagService } from '../service/tag.service';

// Lấy tags phổ biến
const tags = await tagService.getPopularTags(20);

// Lấy IT tags
const itTags = await tagService.getITTags();

// Tìm kiếm tags
const results = await tagService.searchTags('nodejs');
```

---

### 2. Search Service (`search.service.ts`) ⭐

**Chức năng chính:**
- Tìm courses theo tag
- Tìm courses theo nhiều tags
- Tìm cả courses + blogs theo tag
- Gợi ý courses liên quan
- Tìm kiếm nâng cao
- Lộ trình học theo tags

**Ví dụ sử dụng:**
```typescript
import { searchService } from '../service/search.service';

// Tìm courses theo tag
const result = await searchService.searchCoursesByTag('nodejs');

// Tìm kiếm nâng cao
const courses = await searchService.advancedSearch({
  query: 'backend',
  tagSlugs: ['nodejs', 'api'],
  level: 'Intermediate',
  minPrice: 0,
  maxPrice: 1000000,
  take: 10
});

// Gợi ý courses liên quan
const recommended = await searchService.getRecommendedCourses(
  'course-id',
  5
);

// Lộ trình học
const path = await searchService.getLearningPath([
  'nodejs',
  'react',
  'mongodb'
]);
```

---

### 3. Blog Service (`blog.service.ts`)

**Chức năng:**
- CRUD blog posts
- Like/Unlike blog
- Bookmark/Remove bookmark
- Lấy featured posts
- Lấy related posts
- Increment view count

**Ví dụ sử dụng:**
```typescript
import { blogService } from '../service/blog.service';

// Lấy danh sách blogs
const result = await blogService.getBlogPosts({
  page: 1,
  pageSize: 12,
  status: 'PUBLISHED',
  featured: true
});

// Lấy blog theo slug
const blog = await blogService.getBlogPostBySlug('nodejs-tips');

// Like blog
await blogService.likeBlogPost(blogId);

// Bookmark blog
await blogService.bookmarkBlogPost(blogId, 'Bài hay!');

// Lấy featured posts
const featured = await blogService.getFeaturedPosts(5);
```

---

### 4. Category Service (`category.service.ts`)

**Chức năng:**
- Lấy tất cả categories
- Lấy popular categories
- Lấy category theo slug
- Lấy child categories
- CRUD operations (Admin)

**Ví dụ sử dụng:**
```typescript
import { categoryService } from '../service/category.service';

// Lấy categories phổ biến
const categories = await categoryService.getPopularCategories(10);

// Lấy category theo slug
const category = await categoryService.getCategoryBySlug('tutorial');
```

---

### 5. Comment Service (Updated)

**Chức năng mới:**
- ✅ Hỗ trợ comments cho Blog
- ✅ Polymorphic comments (Course hoặc Blog)

**Ví dụ sử dụng:**
```typescript
import { commentService } from '../service/comment.service';

// Comments cho Course (như cũ)
const courseComments = await commentService.getCommentsByCourse(courseId);
await commentService.createComment({
  courseId,
  content: 'Great course!',
  rating: 5
});

// Comments cho Blog (mới)
const blogComments = await commentService.getCommentsByBlogPost(blogPostId);
await commentService.createBlogComment(blogPostId, 'Nice article!');
```

---

## 🎨 COMPONENTS MỚI

### 1. TagCloud Component

**Mô tả:** Hiển thị tag cloud với các tags phổ biến

**Props:**
```typescript
interface TagCloudProps {
  limit?: number;           // Số lượng tags (default: 20)
  showCount?: boolean;      // Hiển thị usage count (default: true)
  onTagClick?: (tag: Tag) => void;  // Custom click handler
}
```

**Sử dụng:**
```tsx
import TagCloud from '../components/TagCloud/TagCloud';

<TagCloud 
  limit={15} 
  showCount={true}
  onTagClick={(tag) => console.log(tag)}
/>
```

**Features:**
- ✅ Size động theo usage count
- ✅ Color từ backend
- ✅ Click để navigate hoặc custom action
- ✅ Hover effects

---

### 2. BlogCard Component

**Mô tả:** Card hiển thị blog post với đầy đủ metadata

**Props:**
```typescript
interface BlogCardProps {
  blog: BlogPost;
  showExcerpt?: boolean;    // Hiển thị excerpt (default: true)
}
```

**Sử dụng:**
```tsx
import BlogCard from '../components/BlogCard/BlogCard';

<BlogCard blog={blogData} showExcerpt={true} />
```

**Features:**
- ✅ Cover image với placeholder gradient
- ✅ Featured/Pinned badges
- ✅ Author info với avatar
- ✅ Tags (click để filter)
- ✅ Stats (views, likes, comments, reading time)
- ✅ Hover effects
- ✅ Click để navigate

---

## 📄 PAGES MỚI

### 1. SearchPage

**Route:** `/search`

**Query Params:**
- `?q=keyword` - Từ khóa tìm kiếm
- `?tag=nodejs` - Filter theo tag
- `?level=Intermediate` - Filter theo level

**Features:**
- ✅ Sidebar với filters (tags, level, price)
- ✅ Tag cloud để quick select
- ✅ Advanced search
- ✅ Tabbed results (All, Courses, Blogs)
- ✅ Responsive design

**Sử dụng:**
```tsx
import SearchPage from '../pages/SearchPage/SearchPage';

// Trong routes
<Route path="/search" element={<SearchPage />} />
```

---

### 2. BlogListPage

**Route:** `/blogs`

**Features:**
- ✅ Featured blogs section
- ✅ Category filter
- ✅ Tag filter
- ✅ Pagination
- ✅ Sidebar với categories, tags, recent posts
- ✅ Responsive design

**Sử dụng:**
```tsx
import BlogListPage from '../pages/BlogListPage/BlogListPage';

// Trong routes
<Route path="/blogs" element={<BlogListPage />} />
```

---

## 🔗 TÍCH HỢP VÀO APP

### Bước 1: Thêm Routes

```tsx
// src/routes/index.tsx hoặc App.tsx
import SearchPage from '../pages/SearchPage/SearchPage';
import BlogListPage from '../pages/BlogListPage/BlogListPage';

const routes = [
  // ... existing routes
  {
    path: '/search',
    element: <SearchPage />
  },
  {
    path: '/blogs',
    element: <BlogListPage />
  }
];
```

### Bước 2: Thêm Navigation Links

```tsx
// Trong Header/Navbar
<Menu>
  <Menu.Item key="courses">
    <Link to="/courses">Khóa Học</Link>
  </Menu.Item>
  <Menu.Item key="blogs">
    <Link to="/blogs">Blog</Link>
  </Menu.Item>
  <Menu.Item key="search">
    <Link to="/search">Tìm Kiếm</Link>
  </Menu.Item>
</Menu>
```

### Bước 3: Cấu hình Environment

```env
# .env
VITE_API_URL=http://localhost:3000
```

---

## 🎯 USE CASES

### Use Case 1: Hiển thị Tag Cloud trên Homepage

```tsx
import TagCloud from '../components/TagCloud/TagCloud';

function HomePage() {
  return (
    <div>
      <h2>🏷️ Công Nghệ Phổ Biến</h2>
      <TagCloud limit={20} showCount={true} />
    </div>
  );
}
```

---

### Use Case 2: Tìm Courses theo Tag

```tsx
import { useNavigate } from 'react-router-dom';
import TagCloud from '../components/TagCloud/TagCloud';

function CoursesPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h3>Tìm theo công nghệ:</h3>
      <TagCloud 
        limit={15}
        onTagClick={(tag) => navigate(`/search?tag=${tag.slug}`)}
      />
    </div>
  );
}
```

---

### Use Case 3: Hiển thị Related Courses

```tsx
import { useEffect, useState } from 'react';
import { searchService } from '../service/search.service';

function CourseDetailPage({ courseId }) {
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    loadRecommended();
  }, [courseId]);

  const loadRecommended = async () => {
    const data = await searchService.getRecommendedCourses(courseId, 5);
    setRecommended(data);
  };

  return (
    <div>
      <h3>Khóa học liên quan</h3>
      {recommended.map(course => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  );
}
```

---

### Use Case 4: Blog với Comments

```tsx
import { useEffect, useState } from 'react';
import { blogService } from '../service/blog.service';
import { commentService } from '../service/comment.service';

function BlogDetailPage({ slug }) {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = async () => {
    const blogData = await blogService.getBlogPostBySlug(slug);
    setBlog(blogData);
    
    // Increment view count
    await blogService.incrementViewCount(blogData.blogPostId);
    
    // Load comments
    const commentsData = await commentService.getCommentsByBlogPost(
      blogData.blogPostId
    );
    setComments(commentsData);
  };

  const handleLike = async () => {
    await blogService.likeBlogPost(blog.blogPostId);
    loadBlog(); // Reload để cập nhật like count
  };

  const handleComment = async (content) => {
    await commentService.createBlogComment(blog.blogPostId, content);
    loadBlog(); // Reload comments
  };

  return (
    <div>
      <h1>{blog?.title}</h1>
      <button onClick={handleLike}>
        👍 Like ({blog?.likeCount})
      </button>
      
      {/* Render comments */}
      {comments.map(comment => (
        <Comment key={comment.commentId} data={comment} />
      ))}
    </div>
  );
}
```

---

## 🎨 STYLING GUIDE

### Theme Colors

Các components sử dụng color palette phù hợp với backend:

```css
/* Tag Colors (từ backend) */
--javascript: #F7DF1E;
--python: #3776AB;
--react: #61DAFB;
--nodejs: #339933;
--typescript: #3178C6;

/* Gradient */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## ✅ CHECKLIST TÍCH HỢP

- [x] Tạo types cho Blog & Tag
- [x] Tạo Tag Service
- [x] Tạo Search Service
- [x] Tạo Blog Service
- [x] Tạo Category Service
- [x] Cập nhật Comment Service
- [x] Tạo TagCloud Component
- [x] Tạo BlogCard Component
- [x] Tạo SearchPage
- [x] Tạo BlogListPage
- [ ] Tạo BlogDetailPage (TODO)
- [ ] Thêm routes vào App
- [ ] Thêm navigation links
- [ ] Test tất cả features

---

## 🚀 NEXT STEPS

1. **Tạo BlogDetailPage** - Trang chi tiết blog với comments
2. **Tạo Admin Pages** - Quản lý blogs, tags, categories
3. **Tích hợp vào Routes** - Thêm vào routing system
4. **Testing** - Test tất cả API calls và UI
5. **Optimization** - Lazy loading, caching, etc.

---

## 📚 TÀI LIỆU THAM KHẢO

- Backend Documentation: `src/Note/BLOG_TAG_SYSTEM_DOCUMENTATION.md`
- Quick Start: `src/Note/QUICK_START_BLOG_TAG.md`
- Comment Update: `src/Note/COMMENT_MODEL_UPDATE.md`

---

**Status:** ✅ Ready for Integration  
**Version:** 1.0.0  
**Last Updated:** 07/12/2025
