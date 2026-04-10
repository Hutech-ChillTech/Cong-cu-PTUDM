# 🚀 Tag & Category API - Quick Reference

## 📌 Tag API

### GET Endpoints
```bash
GET /api/tags                    # Lấy tất cả tags
GET /api/tags?type=COURSE        # Filter theo type
GET /api/tags/popular?limit=20   # Tags phổ biến
GET /api/tags/search?q=nodejs    # Tìm kiếm
GET /api/tags/:tagId             # Theo ID
GET /api/tags/slug/:slug         # Theo slug
```

### POST/PUT/DELETE Endpoints
```bash
POST   /api/tags                 # Tạo mới (Admin)
PUT    /api/tags/:tagId          # Cập nhật (Admin)
DELETE /api/tags/:tagId          # Xóa (Admin)
```

---

## 📂 Category API

### GET Endpoints
```bash
GET /api/categories                      # Lấy tất cả
GET /api/categories/root                 # Root categories (hierarchy)
GET /api/categories/popular?limit=10     # Categories phổ biến
GET /api/categories/:categoryId          # Theo ID
GET /api/categories/slug/:slug           # Theo slug
GET /api/categories/:categoryId/children # Lấy children
```

### POST/PUT/DELETE Endpoints
```bash
POST   /api/categories                   # Tạo mới (Admin)
PUT    /api/categories/:categoryId       # Cập nhật (Admin)
DELETE /api/categories/:categoryId       # Xóa (Admin)
```

---

## 💡 Quick Examples

### Tạo Tag
```bash
POST /api/tags
{
  "name": "Node.js",
  "description": "JavaScript runtime",
  "icon": "🟢",
  "color": "#339933",
  "type": "GENERAL"
}
```

### Tạo Category
```bash
POST /api/categories
{
  "name": "Tutorial",
  "description": "Step-by-step guides",
  "icon": "📚",
  "color": "#3B82F6",
  "orderIndex": 1
}
```

### Tạo Child Category
```bash
POST /api/categories
{
  "name": "Advanced Tutorial",
  "parentId": "parent-category-id",
  "orderIndex": 2
}
```

### Search Tags
```bash
GET /api/tags/search?q=node&limit=5
```

### Get Popular Tags
```bash
GET /api/tags/popular?limit=20&type=GENERAL
```

### Get Category Hierarchy
```bash
GET /api/categories/root
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🎯 Common Use Cases

### 1. Tag Autocomplete
```bash
GET /api/tags/search?q={user-input}&limit=5
```

### 2. Display Tag Cloud
```bash
GET /api/tags/popular?limit=20
```

### 3. Category Menu
```bash
GET /api/categories/root
```

### 4. Filter by Type
```bash
GET /api/tags?type=COURSE
GET /api/tags?type=BLOG
```

---

## 🔑 Key Features

### Tags
- ✅ Shared cho Course & Blog
- ✅ Type classification
- ✅ Usage count tracking
- ✅ Search & autocomplete

### Categories
- ✅ Hierarchy support
- ✅ Post count tracking
- ✅ Order management
- ✅ Parent-child relationships

---

**Full Documentation**: See `TAG_CATEGORY_API_DOCUMENTATION.md`
