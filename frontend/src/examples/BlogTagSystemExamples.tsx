/**
 * EXAMPLE USAGE - Blog & Tag System
 *
 * File này chứa các ví dụ về cách sử dụng các services và components mới
 */

import { useEffect, useState } from "react";
import {
  tagService,
  blogService,
  searchService,
  categoryService,
} from "../service";
import { TagCloud, BlogCard } from "../components";
import type {
  Tag,
  BlogPost,
  CourseSearchResult,
  Category,
  LearningPathResponse,
} from "../types/blog.types";
import type { Comment } from "../service/comment.service";

// ============================================
// EXAMPLE 1: Hiển thị Tag Cloud trên Homepage
// ============================================
export function HomePageExample() {
  return (
    <div>
      <h2>🏷️ Công Nghệ Phổ Biến</h2>
      <TagCloud
        limit={20}
        onTagClick={(tag) => {
          console.log("Tag clicked:", tag);
          // Navigate to search page
          window.location.href = `/search?tag=${tag.slug}`;
        }}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Tìm Courses theo Tag
// ============================================
export function SearchByTagExample() {
  const [courses, setCourses] = useState<CourseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchByTag = async (tagSlug: string) => {
    try {
      setLoading(true);
      const result = await searchService.searchCoursesByTag(tagSlug);
      setCourses(result.courses || []);
      console.log("Found courses:", result.courses);
      console.log("Tag info:", result.tag);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => searchByTag("nodejs")}>
        Tìm khóa học Node.js
      </button>
      {loading && <p>Loading...</p>}
      {courses.map((course) => (
        <div key={course.courseId}>{course.courseName}</div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 3: Advanced Search
// ============================================
export function AdvancedSearchExample() {
  const [results, setResults] = useState<CourseSearchResult[]>([]);

  const performAdvancedSearch = async () => {
    try {
      const data = await searchService.advancedSearch({
        query: "backend",
        tagSlugs: ["nodejs", "api"],
        level: "Intermediate",
        minPrice: 0,
        maxPrice: 1000000,
        take: 10,
      });
      setResults(data.courses || []);
      console.log("Search results:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={performAdvancedSearch}>Tìm kiếm nâng cao</button>
      <div>Tìm thấy {results.length} khóa học</div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Recommended Courses
// ============================================
export function RecommendedCoursesExample({ courseId }: { courseId: string }) {
  const [recommended, setRecommended] = useState<CourseSearchResult[]>([]);

  useEffect(() => {
    loadRecommended();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadRecommended = async () => {
    try {
      const data = await searchService.getRecommendedCourses(courseId, 5);
      setRecommended(data);
      console.log("Recommended courses:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>Khóa học liên quan</h3>
      {recommended.map((course) => (
        <div key={course.courseId}>{course.courseName}</div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Learning Path
// ============================================
export function LearningPathExample() {
  const [path, setPath] = useState<LearningPathResponse>({});

  const loadLearningPath = async () => {
    try {
      const data = await searchService.getLearningPath([
        "nodejs",
        "react",
        "mongodb",
      ]);
      setPath(data);
      console.log("Learning path:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={loadLearningPath}>Xem lộ trình học Full-stack</button>

      {Object.keys(path).map((tagSlug) => (
        <div key={tagSlug}>
          <h3>{tagSlug}</h3>
          <div>
            <h4>Cơ bản</h4>
            {path[tagSlug]?.basic?.map((course) => (
              <div key={course.courseId}>{course.courseName}</div>
            ))}
          </div>
          <div>
            <h4>Trung cấp</h4>
            {path[tagSlug]?.intermediate?.map((course) => (
              <div key={course.courseId}>{course.courseName}</div>
            ))}
          </div>
          <div>
            <h4>Nâng cao</h4>
            {path[tagSlug]?.advanced?.map((course) => (
              <div key={course.courseId}>{course.courseName}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Blog List with Filters
// ============================================
export function BlogListExample() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();

  useEffect(() => {
    loadCategories();
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getPopularCategories(10);
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await blogService.getBlogPosts({
        page: 1,
        limit: 12,
        status: "PUBLISHED",
        category: selectedCategory,
      });
      setBlogs(result.posts);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>📚 Blog</h2>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((cat) => (
          <option key={cat.categoryId} value={cat.categoryId}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Blog Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {blogs.map((blog) => (
          <BlogCard key={blog.blogPostId} blog={blog} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Blog Detail with Comments
// ============================================
export function BlogDetailExample({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadBlog = async () => {
    try {
      // Load blog
      const blogData = await blogService.getBlogPostBySlug(slug);
      setBlog(blogData);

      // Increment view count
      await blogService.incrementViewCount(blogData.blogPostId);

      // Load comments
      const { commentService } = await import("../service/comment.service");
      const commentsData = await commentService.getCommentsByBlogPost(
        blogData.blogPostId,
      );
      setComments(commentsData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    try {
      if (blog.isLiked) {
        await blogService.unlikeBlogPost(blog.blogPostId);
      } else {
        await blogService.likeBlogPost(blog.blogPostId);
      }
      loadBlog(); // Reload
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBookmark = async () => {
    if (!blog) return;
    try {
      if (blog.isBookmarked) {
        await blogService.removeBookmark(blog.blogPostId);
      } else {
        await blogService.bookmarkBlogPost(blog.blogPostId);
      }
      loadBlog(); // Reload
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleComment = async () => {
    if (!blog || !newComment.trim()) return;
    try {
      const { commentService } = await import("../service/comment.service");
      await commentService.createBlogComment(blog.blogPostId, newComment);
      setNewComment("");
      loadBlog(); // Reload
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <div>
      <h1>{blog.title}</h1>
      <img src={blog.coverImage} alt={blog.title} />
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />

      {/* Actions */}
      <div>
        <button onClick={handleLike}>
          👍 {blog.isLiked ? "Unlike" : "Like"} ({blog.likeCount})
        </button>
        <button onClick={handleBookmark}>
          🔖 {blog.isBookmarked ? "Remove" : "Bookmark"}
        </button>
      </div>

      {/* Tags */}
      <div>
        {blog.tags?.map((blogTag) => (
          <span
            key={blogTag.tag.tagId}
            style={{
              padding: "4px 8px",
              margin: "0 4px",
              borderRadius: 4,
              background: "#1890ff",
              color: "white",
            }}
          >
            {blogTag.tag.name}
          </span>
        ))}
      </div>

      {/* Comments */}
      <div>
        <h3>💬 Comments ({blog.commentCount})</h3>

        {/* Comment Form */}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
        />
        <button onClick={handleComment}>Gửi</button>

        {/* Comment List */}
        {comments.map((comment) => (
          <div key={comment.commentId}>
            <strong>{comment.user?.userName}</strong>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Get IT Tags
// ============================================
export function ITTagsExample() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadITTags();
  }, []);

  const loadITTags = async () => {
    try {
      const data = await tagService.getITTags();
      setTags(data);
      console.log("IT Tags:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>🏷️ IT Tags</h3>
      {tags.map((tag) => (
        <span
          key={tag.tagId}
          style={{
            background: "#1890ff",
            color: "white",
            padding: "4px 8px",
            margin: "0 4px",
            borderRadius: 4,
          }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 9: Featured Blogs
// ============================================
export function FeaturedBlogsExample() {
  const [featured, setFeatured] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const data = await blogService.getFeaturedPosts(5);
      setFeatured(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>⭐ Featured Blogs</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {featured.map((blog) => (
          <BlogCard key={blog.blogPostId} blog={blog} showExcerpt={false} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 10: Related Blogs
// ============================================
export function RelatedBlogsExample({ blogPostId }: { blogPostId: string }) {
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogPostId]);

  const loadRelated = async () => {
    try {
      const data = await blogService.getRelatedPosts(blogPostId, 5);
      setRelated(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>📚 Bài viết liên quan</h3>
      {related.map((blog) => (
        <div key={blog.blogPostId}>
          <a href={`/blog/${blog.slug}`}>{blog.title}</a>
        </div>
      ))}
    </div>
  );
}
