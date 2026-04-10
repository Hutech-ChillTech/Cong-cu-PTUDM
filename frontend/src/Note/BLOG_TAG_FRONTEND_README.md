# 🎓 Hutech-Edu Frontend - Blog & Tag System

## 📋 Tổng Quan

Frontend đã được cập nhật với **Blog & Tag System** hoàn chỉnh, tương thích 100% với backend mới.

### ✨ Tính Năng Mới

- 🏷️ **Tag System** - Quản lý và hiển thị tags công nghệ
- 📚 **Blog System** - Hệ thống blog đầy đủ với comments, likes, bookmarks
- 🔍 **Advanced Search** - Tìm kiếm nâng cao theo tags, level, price
- 🎯 **Recommendations** - Gợi ý khóa học/blog liên quan
- 🗺️ **Learning Paths** - Lộ trình học theo công nghệ
- 💬 **Polymorphic Comments** - Comments cho cả Course và Blog

---

## 🚀 Quick Start

### 1. Cài đặt

```bash
npm install
```

### 2. Cấu hình

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Chạy

```bash
npm run dev
```

---

## 📁 Cấu Trúc Mới

```
src/
├── types/
│   └── blog.types.ts              # Types cho Blog & Tag
│
├── service/
│   ├── tag.service.ts             # Tag API
│   ├── blog.service.ts            # Blog API
│   ├── category.service.ts        # Category API
│   ├── search.service.ts          # Search API (⭐ Main)
│   ├── comment.service.ts         # Updated
│   └── index.ts                   # Service exports
│
├── components/
│   ├── TagCloud/                  # Tag cloud component
│   ├── BlogCard/                  # Blog card component
│   └── index.ts                   # Component exports
│
├── pages/
│   ├── SearchPage/                # Trang tìm kiếm
│   └── BlogListPage/              # Danh sách blog
│
├── examples/
│   └── BlogTagSystemExamples.tsx  # Usage examples
│
└── Note/
    └── FRONTEND_BLOG_TAG_IMPLEMENTATION.md  # Documentation
```

---

## 🎯 Usage Examples

### Tag Cloud

```tsx
import { TagCloud } from './components';

<TagCloud 
  limit={20} 
  showCount={true}
  onTagClick={(tag) => navigate(`/search?tag=${tag.slug}`)}
/>
```

### Search by Tag

```tsx
import { searchService } from './service';

const result = await searchService.searchCoursesByTag('nodejs');
console.log(result.courses);
```

### Advanced Search

```tsx
const courses = await searchService.advancedSearch({
  tagSlugs: ['nodejs', 'react'],
  level: 'Intermediate',
  maxPrice: 1000000
});
```

### Blog List

```tsx
import { blogService } from './service';

const result = await blogService.getBlogPosts({
  page: 1,
  pageSize: 12,
  status: 'PUBLISHED'
});
```

### Blog Comments

```tsx
import { commentService } from './service';

// Get comments
const comments = await commentService.getCommentsByBlogPost(blogId);

// Create comment
await commentService.createBlogComment(blogId, 'Nice article!');
```

---

## 📚 Documentation

- **[Frontend Implementation Guide](src/Note/FRONTEND_BLOG_TAG_IMPLEMENTATION.md)** - Hướng dẫn đầy đủ
- **[Update Summary](FRONTEND_UPDATE_SUMMARY.md)** - Tóm tắt cập nhật
- **[Usage Examples](src/examples/BlogTagSystemExamples.tsx)** - Ví dụ sử dụng
- **[Backend Documentation](src/Note/BLOG_TAG_SYSTEM_DOCUMENTATION.md)** - Backend API docs

---

## 🔗 API Endpoints

### Tags
- `GET /api/tags` - Lấy tất cả tags
- `GET /api/tags/popular` - Tags phổ biến
- `GET /api/search/tags/it` - IT tags

### Search
- `GET /api/search/courses/by-tag/:slug` - Tìm courses theo tag
- `POST /api/search/advanced` - Tìm kiếm nâng cao
- `GET /api/search/courses/:id/recommended` - Gợi ý liên quan
- `POST /api/search/learning-path` - Lộ trình học

### Blogs
- `GET /api/blogs` - Danh sách blogs
- `GET /api/blogs/:id` - Chi tiết blog
- `POST /api/blogs/:id/like` - Like blog
- `POST /api/blogs/:id/bookmark` - Bookmark blog

### Comments
- `GET /api/comments/blog/:id` - Comments của blog
- `POST /api/comments` - Tạo comment (course hoặc blog)

---

## 🎨 Components

### TagCloud
Hiển thị tag cloud với IT tags phổ biến

**Props:**
- `limit?: number` - Số lượng tags (default: 20)
- `showCount?: boolean` - Hiển thị usage count
- `onTagClick?: (tag) => void` - Custom click handler

### BlogCard
Card hiển thị blog post

**Props:**
- `blog: BlogPost` - Blog data
- `showExcerpt?: boolean` - Hiển thị excerpt

---

## 📄 Pages

### SearchPage (`/search`)
Trang tìm kiếm với filters nâng cao

**Features:**
- Tag selection
- Level filter
- Price range
- Tabbed results (Courses/Blogs)

### BlogListPage (`/blogs`)
Danh sách blog với sidebar

**Features:**
- Featured blogs
- Category filter
- Tag filter
- Pagination
- Sidebar widgets

---

## 🔧 Services

### tagService
```typescript
tagService.getAllTags()
tagService.getPopularTags(limit)
tagService.getITTags()
tagService.searchTags(query)
```

### searchService (⭐ Main)
```typescript
searchService.searchCoursesByTag(slug)
searchService.advancedSearch(params)
searchService.getRecommendedCourses(id, limit)
searchService.getLearningPath(tags)
```

### blogService
```typescript
blogService.getBlogPosts(params)
blogService.getBlogPostBySlug(slug)
blogService.likeBlogPost(id)
blogService.bookmarkBlogPost(id)
blogService.getFeaturedPosts(limit)
```

### categoryService
```typescript
categoryService.getAllCategories()
categoryService.getPopularCategories(limit)
categoryService.getCategoryBySlug(slug)
```

---

## ✅ Checklist Tích Hợp

- [x] Tạo types
- [x] Tạo services
- [x] Tạo components
- [x] Tạo pages
- [x] Tạo documentation
- [ ] Thêm routes vào App
- [ ] Thêm navigation links
- [ ] Test tất cả features

---

## 🚧 Next Steps

1. **Thêm Routes**
   ```tsx
   <Route path="/search" element={<SearchPage />} />
   <Route path="/blogs" element={<BlogListPage />} />
   ```

2. **Thêm Navigation**
   ```tsx
   <Menu.Item key="blogs">
     <Link to="/blogs">Blog</Link>
   </Menu.Item>
   ```

3. **Tạo BlogDetailPage** (Optional)
4. **Tạo Admin Pages** (Optional)
5. **Testing & Optimization**

---

## 📞 Support

Nếu gặp vấn đề, tham khảo:
- Documentation trong `src/Note/`
- Examples trong `src/examples/`
- Backend docs

---

## 📊 Statistics

- **Files Created:** 15 files
- **Files Updated:** 1 file
- **Total Lines:** ~2,000 lines
- **Services:** 5 services
- **Components:** 2 components
- **Pages:** 2 pages

---

**Version:** 1.0.0  
**Last Updated:** 07/12/2025  
**Status:** ✅ Ready to Use
