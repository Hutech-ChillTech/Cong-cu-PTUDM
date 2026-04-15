# 🚀 Quick Start: Blog & Tag System

## 📦 Installation

### Bước 1: Generate Prisma Client
```bash
npx prisma generate
```

### Bước 2: Run Migration
```bash
# Development
npx prisma db push

# Production
npx prisma migrate deploy
```

### Bước 3: Seed IT Tags (Optional)
```bash
npx ts-node prisma/seed-tags.ts
```

### Bước 4: Start Server
```bash
npm run dev
```

---

## 🔍 API Examples

### Tìm Courses theo Tag
```bash
# Tìm tất cả courses về Node.js
GET http://localhost:3000/api/search/courses/by-tag/nodejs

# Tìm courses theo nhiều tags
POST http://localhost:3000/api/search/courses/by-tags
{
  "tags": ["nodejs", "react", "mongodb"]
}
```

### Advanced Search
```bash
POST http://localhost:3000/api/search/advanced
{
  "query": "backend",
  "tagSlugs": ["nodejs", "api"],
  "level": "Intermediate",
  "minPrice": 0,
  "maxPrice": 1000000,
  "take": 10
}
```

### Gợi Ý Courses Liên Quan
```bash
GET http://localhost:3000/api/search/courses/{courseId}/recommended?limit=5
```

### Lộ Trình Học Theo Tags
```bash
POST http://localhost:3000/api/search/learning-path
{
  "tags": ["nodejs", "react", "mongodb"]
}
```

### Lấy Tags IT Phổ Biến
```bash
GET http://localhost:3000/api/search/tags/it
```

---

## 📚 Documentation

Xem file **BLOG_TAG_SYSTEM_DOCUMENTATION.md** để biết chi tiết đầy đủ.

---

## 🏷️ Available Tags

Sau khi seed, bạn sẽ có **60+ tags** cho lập trình CNTT:

**Languages**: JavaScript, Python, Java, C#, TypeScript, Go, Rust, PHP, Ruby...

**Frontend**: React, Angular, Vue.js, Next.js, Svelte...

**Backend**: Node.js, Express, NestJS, Django, Flask, Spring Boot, Laravel...

**Databases**: PostgreSQL, MySQL, MongoDB, Redis, Firebase...

**DevOps**: Docker, Kubernetes, Git, AWS, Azure, CI/CD...

**AI/ML**: TensorFlow, PyTorch, Machine Learning, Deep Learning...

**Mobile**: React Native, Flutter, iOS, Android...

---

## 🎯 Main Features

✅ **Tag System** - Shared tags for courses & blogs  
✅ **Course Search by Tags** - Find courses by technology  
✅ **Advanced Search** - Filter by tags, level, price  
✅ **Recommendations** - Smart course suggestions  
✅ **Learning Paths** - Structured learning by tags  
✅ **IT Tags** - 60+ pre-defined programming tags  

---

## 📊 Database Models

- **Tag** - Shared tag system
- **Category** - Blog categories
- **BlogPost** - Blog posts
- **CourseTag** - Course ↔ Tag relationship
- **BlogPostTag** - Blog ↔ Tag relationship
- **BlogPostCategory** - Blog ↔ Category relationship
- **BlogLike** - Blog likes
- **BlogBookmark** - Blog bookmarks

---

## 🔧 Troubleshooting

### Lỗi: "Module '@prisma/client' has no exported member 'BlogPost'"
```bash
npx prisma generate
```

### Lỗi: "Property 'blogPost' does not exist"
```bash
npx prisma db push
```

---

**Happy Coding! 🎉**
