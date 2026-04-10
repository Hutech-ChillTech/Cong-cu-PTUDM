# Frontend API Update - Blog, Tag & Category

## Ngày cập nhật: 2025-12-07

### Tóm tắt
Đã cập nhật toàn bộ frontend để đồng bộ với backend API mới nhất theo tài liệu `BLOG_TAG_CATEGORY_API.md`.

---

## 📝 Các thay đổi chính

### 1. **Type Definitions** (`src/types/blog.types.ts`)

#### Tag Interface - Đã loại bỏ các field:
- ❌ `color` - Không còn được hỗ trợ
- ❌ `usageCount` - Không còn được hỗ trợ  
- ❌ `courseCount` - Không còn được hỗ trợ
- ❌ `blogCount` - Không còn được hỗ trợ
- ❌ `createdAt` → ✅ `created_at` (snake_case)
- ❌ `updatedAt` → ✅ `updated_at` (snake_case)

#### Category Interface - Đã loại bỏ:
- ❌ `postCount` - Không còn được hỗ trợ
- ❌ `createdAt` → ✅ `created_at` (snake_case)
- ❌ `updatedAt` → ✅ `updated_at` (snake_case)

#### BlogPost Interface - Đã thêm:
- ✅ `metaTitle` - SEO title
- ✅ `metaDescription` - SEO description
- ✅ `metaKeywords` - SEO keywords
- ✅ `scheduledAt` - Thời gian lên lịch xuất bản
- ✅ `shareCount` - Số lượt share
- ❌ `createdAt` → ✅ `created_at` (snake_case)
- ❌ `updatedAt` → ✅ `updated_at` (snake_case)

#### CreateBlogPostRequest - Đã thêm:
- ✅ `slug` - Optional, auto-generated nếu không truyền
- ✅ `metaTitle` - SEO title
- ✅ `metaDescription` - SEO description
- ✅ `metaKeywords` - SEO keywords
- ✅ `scheduledAt` - Lên lịch xuất bản
- ✅ `readingTime` - Thời gian đọc (phút)

---

### 2. **Tag Service** (`src/service/tag.service.ts`)

#### Đã cập nhật:

**`getAllTags(type?: TagType)`**
```typescript
// TRƯỚC: getAllTags(): Promise<Tag[]>
// SAU: getAllTags(type?: TagType): Promise<Tag[]>
// Có thể filter theo type: COURSE | BLOG | GENERAL
```

**`getPopularTags(limit?: number, type?: TagType)`**
```typescript
// TRƯỚC: getPopularTags(limit = 20)
// SAU: getPopularTags(limit = 10, type?: TagType)
// - Default limit giảm từ 20 → 10
// - Thêm tham số type để filter
```

**`searchTags(query: string, limit?: number)`**
```typescript
// TRƯỚC: searchTags(query: string)
// SAU: searchTags(query: string, limit = 10)
// Thêm tham số limit với default = 10
```

**`updateTag()`**
```typescript
// Thêm field 'type' vào data có thể update
```

---

### 3. **Category Service** (`src/service/category.service.ts`)
✅ Đã đồng bộ với API, không cần thay đổi gì thêm.

---

### 4. **Blog Service** (`src/service/blog.service.ts`)
✅ Đã hỗ trợ đầy đủ các tham số:
- `authorId` - Filter theo tác giả
- SEO fields trong create/update
- `scheduledAt` cho scheduled posts

---

## 🔧 Các file đã cập nhật

### 1. Type Definitions
- ✅ `src/types/blog.types.ts` - Cập nhật interfaces

### 2. Services  
- ✅ `src/service/tag.service.ts` - Thêm type filtering
- ✅ `src/service/category.service.ts` - Đã đồng bộ
- ✅ `src/service/blog.service.ts` - Đã đồng bộ

### 3. Pages - Loại bỏ deprecated fields
- ✅ `src/pages/BlogListPage/BlogListPage.tsx`
  - Loại bỏ `category.postCount`
- ✅ `src/pages/BlogDetailPage/BlogDetailPage.tsx`
  - Loại bỏ `tag.color`
  - Fix `createdAt` → `created_at`

### 4. Examples
- ✅ `src/examples/BlogTagSystemExamples.tsx`
  - Loại bỏ `tag.color`, `tag.usageCount`
  - Dùng màu mặc định `#1890ff`

---

## 🎯 API Endpoints (Tham khảo)

### Tag API - `/api/tags`
```
GET    /                  - Lấy tất cả tags (có thể filter ?type=BLOG)
GET    /popular           - Tags phổ biến (?limit=10&type=BLOG)
GET    /search            - Tìm kiếm (?q=name&limit=10)
GET    /:tagId            - Lấy chi tiết tag
GET    /slug/:slug        - Lấy tag theo slug
POST   /                  - Tạo tag mới (Admin)
PUT    /:tagId            - Cập nhật tag (Admin)
DELETE /:tagId            - Xóa tag (Admin)
```

### Category API - `/api/categories`
```
GET    /                  - Lấy tất cả categories
GET    /root              - Lấy root categories (kèm children nested)
GET    /popular           - Categories phổ biến (?limit=10)
GET    /:categoryId       - Lấy chi tiết category
GET    /slug/:slug        - Lấy category theo slug
GET    /:categoryId/children - Lấy children của category
POST   /                  - Tạo category mới (Admin)
PUT    /:categoryId       - Cập nhật category (Admin)
DELETE /:categoryId       - Xóa category (Admin)
```

### Blog Post API - `/api/blog-posts`
```
GET    /                  - Lấy danh sách (Pagination + Filter)
GET    /featured          - Lấy bài viết nổi bật
GET    /:id               - Lấy chi tiết theo ID
GET    /slug/:slug        - Lấy chi tiết theo slug
POST   /                  - Tạo bài viết (Requires Auth)
PUT    /:id               - Cập nhật bài viết (Requires Auth)
DELETE /:id               - Xóa bài viết (Requires Auth)
```

---

## 💡 Ví dụ sử dụng mới

### Tạo Blog Post với SEO
```typescript
const newPost = await blogService.createBlogPost({
  title: "Hướng dẫn React Performance",
  slug: "huong-dan-react-performance",  // Optional
  content: "...",
  excerpt: "Tối ưu hóa React app...",
  
  // SEO Fields - MỚI
  metaTitle: "React Performance 2024 - Hướng dẫn chi tiết",
  metaDescription: "Học cách tối ưu React với memo, lazy loading...",
  metaKeywords: "react, performance, optimization, memo",
  
  // Schedule - MỚI  
  status: "SCHEDULED",
  scheduledAt: "2025-12-25T10:00:00Z",
  
  categoryIds: ["uuid1", "uuid2"],
  tagIds: ["uuid3", "uuid4"],
  isFeatured: true,
  readingTime: 10
});
```

### Lọc Tags theo Type
```typescript
// Lấy tags BLOG
const blogTags = await tagService.getAllTags('BLOG');

// Lấy popular tags COURSE
const courseTags = await tagService.getPopularTags(10, 'COURSE');

// Tìm kiếm với limit
const results = await tagService.searchTags('react', 5);
```

---

## ⚠️ Breaking Changes

### 1. Loại bỏ các field không còn tồn tại:
- `Tag.color` - Không còn được backend trả về
- `Tag.usageCount`, `Tag.courseCount`, `Tag.blogCount`
- `Category.postCount`

### 2. Đổi tên field (snake_case):
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### 3. Default values thay đổi:
- `getPopularTags()` default limit: 20 → 10

---

## ✅ Testing

Các API đã được test và hoạt động tốt với:
- ✅ Lấy danh sách tags/categories/blogs
- ✅ Tạo/cập nhật/xóa với đầy đủ fields mới
- ✅ Filter theo type, status, author
- ✅ SEO metadata
- ✅ Scheduled posts

---

## 📚 Tài liệu tham khảo
- Backend API: `src/Note/BLOG_TAG_CATEGORY_API.md`
- Type Definitions: `src/types/blog.types.ts`

---

**Cập nhật bởi:** Antigravity AI Assistant
**Ngày:** 2025-12-07
