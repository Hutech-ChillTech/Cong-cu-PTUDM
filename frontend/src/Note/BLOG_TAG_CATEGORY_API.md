# Hutech Edu - Blog, Tag & Category API

Tài liệu tổng hợp các API cho hệ thống Blog, Tag và Category. Bao gồm endpoint, phương thức, và cấu trúc dữ liệu JSON để test trên Postman.

---

## 1. Tag API

**Base URL:** `/api/tags`

### 1.1. Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách tất cả tags (có thể filter theo `type` query param) | Public |
| `GET` | `/popular` | Lấy danh sách tags phổ biến (query: `?limit=10&type=BLOG`) | Public |
| `GET` | `/search` | Tìm kiếm tags theo tên (query: `?q=name&limit=10`) | Public |
| `GET` | `/:tagId` | Lấy chi tiết tag theo ID | Public |
| `GET` | `/slug/:slug` | Lấy chi tiết tag theo Slug | Public |
| `POST` | `/` | Tạo tag mới | Admin |
| `PUT` | `/:tagId` | Cập nhật tag | Admin |
| `DELETE` | `/:tagId` | Xóa tag | Admin |

### 1.2. Schema Fields

```typescript
{
  tagId: string (UUID),         // ID duy nhất
  name: string,                 // Tên tag (unique)
  slug: string,                 // URL-friendly slug (unique)
  description?: string,         // Mô tả tag (optional)
  type: TagType,                // COURSE | BLOG | GENERAL
  created_at: DateTime,
  updated_at: DateTime
}
```

### 1.3. Postman Data (JSON)

**Create Tag (POST /):**
```json
{
  "name": "Node.js",
  "description": "JavaScript runtime built on Chrome's V8 JavaScript engine.",
  "type": "GENERAL"
}
```
*Note: `slug` sẽ được tự động tạo từ `name`. Type có thể là `GENERAL`, `COURSE`, hoặc `BLOG`.*

**Update Tag (PUT /:tagId):**
```json
{
  "name": "Node.js Advanced",
  "description": "Updated description",
  "type": "COURSE"
}
```

**Get Popular Tags (GET /popular):**
- Query params: `?limit=10&type=BLOG`
- Type là optional, nếu không truyền sẽ lấy tất cả types

**Search Tags (GET /search):**
- Query params: `?q=node&limit=5`
- `q` là required

---

## 2. Category API

**Base URL:** `/api/categories`

### 2.1. Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách tất cả categories | Public |
| `GET` | `/root` | Lấy danh sách categories gốc (parent = null) kèm children nested | Public |
| `GET` | `/popular` | Lấy danh sách categories phổ biến (query: `?limit=10`) | Public |
| `GET` | `/:categoryId` | Lấy chi tiết category theo ID | Public |
| `GET` | `/slug/:slug` | Lấy chi tiết category theo Slug | Public |
| `GET` | `/:categoryId/children` | Lấy danh sách category con của 1 category | Public |
| `POST` | `/` | Tạo category mới | Admin |
| `PUT` | `/:categoryId` | Cập nhật category | Admin |
| `DELETE` | `/:categoryId` | Xóa category | Admin |

### 2.2. Schema Fields

```typescript
{
  categoryId: string (UUID),    // ID duy nhất
  name: string,                 // Tên category (unique)
  slug: string,                 // URL-friendly slug (unique)
  description?: string,         // Mô tả category (optional)
  parentId?: string (UUID),     // ID của category cha (null = root)
  orderIndex: number,           // Thứ tự hiển thị (default: 0)
  created_at: DateTime,
  updated_at: DateTime,
  
  // Relations
  parent?: Category,            // Category cha
  children?: Category[],        // Categories con
  blogPosts?: BlogPostCategory[]
}
```

### 2.3. Postman Data (JSON)

**Create Category (POST /):**
```json
{
  "name": "Backend Development",
  "description": "Chuyên mục về lập trình backend, server-side.",
  "parentId": null,
  "orderIndex": 1
}
```
*Note: `slug` sẽ được tự động tạo từ `name`. `parentId` là UUID của category cha hoặc `null` nếu là root.*

**Update Category (PUT /:categoryId):**
```json
{
  "name": "Advanced Backend",
  "description": "Updated description",
  "orderIndex": 2
}
```

**Create Nested Category:**
```json
{
  "name": "Node.js Backend",
  "description": "Backend development with Node.js",
  "parentId": "<parent_category_uuid>",
  "orderIndex": 1
}
```

---

## 3. Blog Post API

**Base URL:** `/api/blog-posts`

### 3.1. Endpoints

| Method | Endpoint | Description | Access | Authentication |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách bài viết (Pagination, Filter) | Public | No |
| `GET` | `/featured` | Lấy danh sách bài viết nổi bật | Public | No |
| `GET` | `/:id` | Lấy chi tiết bài viết theo ID | Public | No |
| `GET` | `/slug/:slug` | Lấy chi tiết bài viết theo Slug | Public | No |
| `POST` | `/` | Tạo bài viết mới | User/Admin | **YES (Bearer Token)** |
| `PUT` | `/:id` | Cập nhật bài viết | Author/Admin | **YES (Bearer Token)** |
| `DELETE` | `/:id` | Xóa bài viết | Author/Admin | **YES (Bearer Token)** |

### 3.2. Query Parameters (GET /)

| Parameter | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `page` | number | Số trang | 1 |
| `limit` | number | Số item/trang | 10 |
| `search` | string | Tìm kiếm theo title hoặc content | - |
| `authorId` | UUID | Filter theo ID tác giả | - |
| `status` | BlogStatus | DRAFT, PUBLISHED, ARCHIVED, SCHEDULED | - |

### 3.3. Schema Fields

```typescript
{
  blogPostId: string (UUID),
  
  // Content
  title: string,                  // Tiêu đề bài viết
  slug: string (unique),          // URL-friendly slug
  content: string,                // Nội dung (Markdown/HTML)
  excerpt?: string,               // Tóm tắt ngắn
  coverImage?: string,            // URL ảnh bìa
  
  // SEO
  metaTitle?: string,             // SEO title
  metaDescription?: string,       // SEO description
  metaKeywords?: string,          // SEO keywords
  
  // Status & Publishing
  status: BlogStatus,             // DRAFT | PUBLISHED | ARCHIVED | SCHEDULED
  publishedAt?: DateTime,         // Thời gian xuất bản
  scheduledAt?: DateTime,         // Lên lịch xuất bản
  
  // Stats
  viewCount: number,              // Lượt xem (default: 0)
  likeCount: number,              // Lượt thích (default: 0)
  commentCount: number,           // Số comment (default: 0)
  bookmarkCount: number,          // Số lượt bookmark (default: 0)
  shareCount: number,             // Số lượt share (default: 0)
  readingTime?: number,           // Thời gian đọc (phút)
  
  // Author
  authorId: string (UUID),        // ID tác giả
  
  // Featured
  isFeatured: boolean,            // Bài viết nổi bật (default: false)
  isPinned: boolean,              // Ghim lên đầu (default: false)
  
  // Timestamps
  created_at: DateTime,
  updated_at: DateTime,
  
  // Relations
  author: User,
  categories: BlogPostCategory[],
  tags: BlogPostTag[],
  comments: Comment[],
  likes: BlogLike[],
  bookmarks: BlogBookmark[]
}
```

### 3.4. Postman Data (JSON)

**Create Blog Post (POST /):**

*Headers:*
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

*Body:*
```json
{
  "title": "Hướng dẫn tối ưu hóa hiệu năng React",
  "slug": "huong-dan-toi-uu-hoa-hieu-nang-react-2024",
  "excerpt": "Các kỹ thuật memorize, code splitting và virtualization trong React.",
  "content": "# Tối ưu hóa React\n\n## 1. Sử dụng React.memo...",
  "coverImage": "https://example.com/react-optimization.jpg",
  "status": "PUBLISHED",
  "metaTitle": "Tối ưu React 2024 - Hướng dẫn chi tiết",
  "metaDescription": "Hướng dẫn chi tiết các kỹ thuật tối ưu hóa hiệu năng React 2024",
  "metaKeywords": "react, performance, optimization, memo, code splitting",
  "categoryIds": ["<category_uuid_1>", "<category_uuid_2>"],
  "tagIds": ["<tag_uuid_1>", "<tag_uuid_2>"],
  "isFeatured": true,
  "isPinned": false,
  "readingTime": 10
}
```

*Note:* 
- `authorId` sẽ được tự động lấy từ Token của user đăng nhập
- `slug` nên là unique và URL-friendly
- `status` có thể là: `DRAFT`, `PUBLISHED`, `ARCHIVED`, `SCHEDULED`
- `categoryIds` và `tagIds` là mảng UUID của categories và tags đã tạo trước

**Update Blog Post (PUT /:id):**

*Headers:*
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

*Body (Partial Update):*
```json
{
  "title": "Hướng dẫn tối ưu hóa hiệu năng React - Updated",
  "status": "PUBLISHED",
  "isFeatured": true,
  "excerpt": "Updated excerpt..."
}
```

**Create Draft Post:**
```json
{
  "title": "My Draft Post",
  "content": "Draft content...",
  "status": "DRAFT"
}
```

**Schedule Post for Future:**
```json
{
  "title": "Scheduled Post",
  "content": "This will be published later...",
  "status": "SCHEDULED",
  "scheduledAt": "2025-12-25T10:00:00Z"
}
```

---

## 4. Testing Workflow in Postman

### 4.1. Chuẩn bị

1. **Seed Data**: Chạy seed script để có Tags và Categories mẫu
   ```bash
   npm run seed-data
   ```

2. **Login**: Gọi API Login để lấy `accessToken`
   ```
   POST /api/users/login
   Body: { "email": "...", "password": "..." }
   ```

### 4.2. Test Flow Tags

1. **Create Tags:**
   ```
   POST /api/tags
   Body: { "name": "React", "type": "BLOG" }
   POST /api/tags
   Body: { "name": "Node.js", "type": "GENERAL" }
   ```

2. **Get All Tags:**
   ```
   GET /api/tags
   ```

3. **Get Popular Tags:**
   ```
   GET /api/tags/popular?limit=5&type=BLOG
   ```

4. **Search Tags:**
   ```
   GET /api/tags/search?q=react&limit=5
   ```

### 4.3. Test Flow Categories

1. **Create Root Category:**
   ```
   POST /api/categories
   Body: {
     "name": "Frontend Development",
     "description": "All about frontend",
     "orderIndex": 1
   }
   ```

2. **Create Child Category:**
   ```
   POST /api/categories
   Body: {
     "name": "React Tutorials",
     "parentId": "<frontend_category_uuid>",
     "orderIndex": 1
   }
   ```

3. **Get Root Categories:**
   ```
   GET /api/categories/root
   ```

4. **Get Category Children:**
   ```
   GET /api/categories/<category_uuid>/children
   ```

### 4.4. Test Flow Blog Posts

1. **Get Tag & Category IDs:**
   ```
   GET /api/tags
   GET /api/categories
   ```
   → Copy các UUID cần dùng

2. **Create Blog Post:**
   ```
   POST /api/blog-posts
   Headers: Authorization: Bearer <token>
   Body: { 
     "title": "...", 
     "content": "...",
     "tagIds": ["<uuid1>", "<uuid2>"],
     "categoryIds": ["<uuid3>"]
   }
   ```

3. **Get All Blog Posts:**
   ```
   GET /api/blog-posts?page=1&limit=10
   ```

4. **Get Featured Posts:**
   ```
   GET /api/blog-posts/featured
   ```

5. **Get Blog by Slug:**
   ```
   GET /api/blog-posts/slug/<slug>
   ```

6. **Update Blog Post:**
   ```
   PUT /api/blog-posts/<id>
   Headers: Authorization: Bearer <token>
   Body: { "title": "Updated title", "isFeatured": true }
   ```

7. **Delete Blog Post:**
   ```
   DELETE /api/blog-posts/<id>
   Headers: Authorization: Bearer <token>
   ```

### 4.5. Advanced Queries

**Filter by Status:**
```
GET /api/blog-posts?status=PUBLISHED&page=1&limit=10
```

**Filter by Author:**
```
GET /api/blog-posts?authorId=<user_uuid>&status=DRAFT
```

**Search Posts:**
```
GET /api/blog-posts?search=react&limit=20
```

---

## 5. Important Notes

### 5.1. Authentication

- **Public endpoints**: Không cần token
- **Protected endpoints**: Cần `Authorization: Bearer <token>` trong header
- Token lấy từ API login: `POST /api/users/login`

### 5.2. Blog Status Flow

```
DRAFT → PUBLISHED
DRAFT → SCHEDULED → PUBLISHED (auto publish khi đến scheduledAt)
PUBLISHED → ARCHIVED
```

### 5.3. Permissions

- **User**: Có thể tạo, sửa, xóa bài viết của chính mình
- **Admin**: Có thể tạo, sửa, xóa mọi bài viết
- **Public**: Chỉ xem được bài viết PUBLISHED

### 5.4. Slug Generation

- Slug được tự động tạo từ `name` hoặc `title`
- Nếu muốn custom slug, truyền `slug` trong body
- Slug phải unique

### 5.5. Category Hierarchy

- Category có thể lồng nhau nhiều cấp
- `parentId = null`: Root category
- `orderIndex`: Thứ tự hiển thị
- Khi xóa parent category, children sẽ bị set `parentId = null` (onDelete: SetNull)
