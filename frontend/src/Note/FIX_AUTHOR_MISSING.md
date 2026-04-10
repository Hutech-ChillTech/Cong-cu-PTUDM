# ✅ Fixed: Lỗi "Argument `author` is missing"

## 🔴 Lỗi gốc:

```
Argument `author` is missing.
```

### Nguyên nhân:
Khi tạo BlogPost, Prisma yêu cầu **relation `author`** được connect, không thể chỉ set `authorId` field đơn thuần.

## ✅ Giải pháp đã áp dụng:

### Thay đổi trong `blog.service.ts`:

**❌ Code cũ (sai):**
```typescript
async createPost(data: CreateBlogPostDto) {
  const { tagIds, categoryIds, ...postData } = data;
  
  const createData: any = {
    ...postData,  // ❌ Bao gồm cả authorId field
  };
  
  return this.prisma.blogPost.create({
    data: createData  // ❌ Thiếu author relation
  });
}
```

**✅ Code mới (đúng):**
```typescript
async createPost(data: CreateBlogPostDto) {
  const { tagIds, categoryIds, authorId, ...postData } = data;
  //                            ^^^^^^^^ Extract authorId ra
  
  const createData: any = {
    ...postData,
    // ✅ Connect author qua relation
    author: {
      connect: { userId: authorId }
    }
  };
  
  return this.prisma.blogPost.create({
    data: createData,
    include: {
      author: { select: { userId: true, userName: true, email: true } },
      tags: { include: { tag: true } },
      categories: { include: { category: true } }
    }
  });
}
```

### Điểm khác biệt:

1. **Extract `authorId`** ra khỏi `...postData`
2. **Thêm `author` relation** với `connect`
3. **Include author data** trong response để frontend có thông tin tác giả

---

## 🧪 Test lại:

### Request:
```http
POST http://localhost:3000/api/blog-posts
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "title": "Bắt đầu lập trình như thế nào?",
  "content": "<h2>Nội dung blog...</h2>",
  "excerpt": "Hướng dẫn cho người mới...",
  "status": "PUBLISHED",
  "categoryIds": ["87d96c69-2283-49ae-bcea-88b0c726cf76"],
  "tagIds": ["658a22dc-d945-4922-bfa5-5331a6e4bede"]
}
```

### Expected Response (201 Created):
```json
{
  "blogPostId": "...",
  "title": "Bắt đầu lập trình như thế nào?",
  "slug": "bat-dau-lap-trinh-nhu-the-nao",
  "content": "<h2>Nội dung blog...</h2>",
  "author": {
    "userId": "...",
    "userName": "Admin",
    "email": "admin@example.com",
    "avatarURL": "..."
  },
  "categories": [
    {
      "category": {
        "categoryId": "...",
        "name": "Tutorial",
        "slug": "tutorial"
      }
    }
  ],
  "tags": [
    {
      "tag": {
        "tagId": "...",
        "name": "Beginner",
        "slug": "beginner"
      }
    }
  ]
}
```

---

## 📋 Các bước sau khi fix:

1. ✅ **Rebuild code:**
   ```bash
   npm run build
   ```

2. ✅ **Restart server:**
   ```bash
   npm run dev
   # hoặc npm start (nếu đang production)
   ```

3. ✅ **Test lại trên frontend**

---

## 💡 Lưu ý về Prisma Relations:

Khi tạo record có foreign key, có 2 cách:

### Cách 1: Dùng relation (Recommended)
```typescript
author: {
  connect: { userId: authorId }
}
```

### Cách 2: Dùng field trực tiếp (Không khuyến khích)
```typescript
authorId: authorId  // Có thể bị lỗi nếu Prisma enforce relation
```

**Best practice:** Luôn dùng `connect` với relation khi có thể!

---

## 🎯 Checklist:

- [x] Extract `authorId` ra khỏi spread operator
- [x] Thêm `author: { connect: { userId } }`
- [x] Include author data trong response
- [x] Rebuild code (`npm run build`)
- [ ] Restart server
- [ ] Test lại API

---

## 🚀 Next Steps:

Sau khi server restart xong, thử tạo blog post lại. Lỗi "Argument author is missing" sẽ biến mất!

Good luck! 🎉
