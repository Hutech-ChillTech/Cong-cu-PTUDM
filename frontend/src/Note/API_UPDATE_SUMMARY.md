# ✅ API CALLS UPDATED - BASED ON MD DOCUMENTATION

## 🎉 Summary

Updated the frontend services and pages to align with `BLOG_TAG_CATEGORY_API.md` specifications.

---

## 🔄 Service Updates

### 1. Tag Service (`src/service/tag.service.ts`)
- ✅ **Updated Types**: Removed `color` field from `createTag` and `updateTag` payloads as it is not in the API documentation.
- ✅ **Verification**: Checked endpoints match `/api/tags`.

### 2. Category Service (`src/service/category.service.ts`)
- ✅ **Added Endpoint**: Added `getRootCategories` (`GET /api/categories/root`) as specified in the MD.
- ✅ **Verification**: Checked endpoints match `/api/categories`.

### 3. Blog Service (`src/service/blog.service.ts`)
- ✅ **Base URL**: Changed from `/api/blogs` to `/api/blog-posts` to match MD.
- ✅ **Query Parameters**:
  - Updated `pageSize` → `limit`
  - Updated `categoryId` → `category` (slug)
  - Updated `tagSlug` → `tag` (slug)
  - Added `sort` parameter (new, popular, trending)
- ✅ **Interactive Endpoints**:
  - Updated `likeBlogPost` and `unlikeBlogPost` to unified `toggleLikeBlogPost` (POST)
  - Updated `bookmarkBlogPost` and `removeBookmark` to unified `toggleBookmarkBlogPost` (POST)
  - Kept legacy methods as wrappers/aliases for backward compatibility but using new endpoints.

---

## 📄 Page Updates

### 1. Blog List Page (`src/pages/BlogListPage/BlogListPage.tsx`)
- ✅ **Filter Logic**: Updated category filter to use **Slug** (`cat.slug`) instead of ID.
- ✅ **API Call**: Updated `fetchBlogs` to use new parameter names (`limit`, `category`, `tag`).

### 2. Admin Blog Page (`src/pages/Admin/AdminBlogPage.tsx`)
- ✅ **API Call**: Updated `fetchBlogs` to use `limit` instead of `pageSize`.

---

## ⚠️ Notes for Backend Team

1. **Blog API URL**: The frontend now expects `/api/blog-posts` instead of `/api/blogs`.
2. **Slug Filtering**: The frontend now sends `category` (slug) and `tag` (slug) for filtering, not IDs.
3. **Toggle Endpoints**: The frontend expects `POST /:id/like` and `POST /:id/bookmark` to toggle state (add if not exists, remove if exists).

---

**Status:** ✅ Fully Synchronized with `BLOG_TAG_CATEGORY_API.md`
