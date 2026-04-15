import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import {
  LikeOutlined,
  LikeFilled,
  BookOutlined,
  BookFilled,
} from "@ant-design/icons";
import { blogService } from "../../service/blog.service";
// import { commentService } from '../../service/comment.service';
import TableOfContents from "../../components/TableOfContents/TableOfContents";
import type { BlogPost } from "../../types/blog.types";
// import type { Comment } from '../../service/comment.service';
import "../../styles/BlogDetailPage.css";

const { Title, Paragraph } = Typography;

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  // const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  // const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  // const [commentText, setCommentText] = useState('');
  // const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const blogData = await blogService.getBlogPostBySlug(slug!);
      setBlog(blogData);

      // Increment view count (optional - don't fail if endpoint doesn't exist)
      try {
        await blogService.incrementViewCount(blogData.blogPostId);
      } catch {
        console.log("View count increment not available");
      }

      // Load comments (optional) - Commented out for now
      // try {
      //   const commentsData = await commentService.getCommentsByBlogPost(
      //     blogData.blogPostId
      //   );
      //   setComments(commentsData);
      // } catch (error) {
      //   console.log('Comments not available');
      //   setComments([]);
      // }

      // Load related blogs (optional) - Commented out for now
      // try {
      //   const related = await blogService.getRelatedPosts(blogData.blogPostId, 3);
      //   setRelatedBlogs(related);
      // } catch (error) {
      //   console.log('Related posts not available');
      //   setRelatedBlogs([]);
      // }
    } catch (error) {
      console.error("Error loading blog:", error);
      message.error("Không thể tải bài viết");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;

    // Check if feature is available
    if (blog.isLiked === undefined) {
      message.info("Tính năng Like đang được phát triển");
      return;
    }

    try {
      console.log("Like button clicked, isLiked:", blog.isLiked);
      if (blog.isLiked) {
        await blogService.unlikeBlogPost(blog.blogPostId);
        message.success("Đã bỏ thích");
      } else {
        await blogService.likeBlogPost(blog.blogPostId);
        message.success("Đã thích bài viết");
      }
      loadBlog();
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { status?: number; data?: { message?: string } };
      };
      console.error("Like error:", err);
      if (err.response?.status === 401) {
        message.error("Vui lòng đăng nhập để thích bài viết");
      } else if (err.response?.status === 404) {
        message.warning("Tính năng Like đang được phát triển");
      } else {
        message.error("Có lỗi xảy ra: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleBookmark = async () => {
    if (!blog) return;

    // Check if feature is available
    if (blog.isBookmarked === undefined) {
      message.info("Tính năng Lưu bài viết đang được phát triển");
      return;
    }

    try {
      console.log("Bookmark button clicked, isBookmarked:", blog.isBookmarked);
      if (blog.isBookmarked) {
        await blogService.removeBookmark(blog.blogPostId);
        message.success("Đã xóa khỏi danh sách lưu");
      } else {
        await blogService.bookmarkBlogPost(blog.blogPostId);
        message.success("Đã lưu bài viết");
      }
      loadBlog();
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { status?: number; data?: { message?: string } };
      };
      console.error("Bookmark error:", err);
      if (err.response?.status === 401) {
        message.error("Vui lòng đăng nhập để lưu bài viết");
      } else if (err.response?.status === 404) {
        message.warning("Tính năng Lưu bài viết đang được phát triển");
      } else {
        message.error("Có lỗi xảy ra: " + (err.message || "Unknown error"));
      }
    }
  };

  // Comment feature disabled for now
  // const handleSubmitComment = async () => {
  //   if (!blog || !commentText.trim()) return;
  //   try {
  //     setSubmittingComment(true);
  //     await commentService.createBlogComment(blog.blogPostId, commentText);
  //     setCommentText('');
  //     message.success('Đã gửi bình luận');
  //     loadBlog();
  //   } catch (error: any) {
  //     if (error.response?.status === 401) {
  //       message.error('Vui lòng đăng nhập để bình luận');
  //     } else {
  //       message.error('Có lỗi xảy ra');
  //     }
  //   } finally {
  //     setSubmittingComment(false);
  //   }
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="blog-detail-page">
      <Row gutter={[32, 0]}>
        {/* Table of Contents - Left Sidebar */}
        <Col xs={0} lg={6}>
          <TableOfContents content={blog.content} />
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={18}>
          {/* Title */}
          <Title level={1} className="blog-title">
            {blog.title}
          </Title>

          {/* Tags & Date */}
          <div className="blog-meta-tags">
            {blog.tags &&
              blog.tags.map((t) => (
                <Tag key={t.tag.tagId} color="red">
                  {t.tag.name}
                </Tag>
              ))}
            <Tag color="blue">
              {formatDate(blog.publishedAt || blog.created_at)}
            </Tag>
          </div>

          <Divider />

          {/* Excerpt */}
          {blog.excerpt && (
            <Paragraph className="blog-excerpt" strong>
              {blog.excerpt}
            </Paragraph>
          )}

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Action Buttons */}
          <Divider />
          <Space size="large" className="blog-actions">
            <Button
              type={blog.isLiked ? "primary" : "default"}
              icon={blog.isLiked ? <LikeFilled /> : <LikeOutlined />}
              onClick={handleLike}
            >
              {blog.likeCount} Thích
            </Button>
            <Button
              type={blog.isBookmarked ? "primary" : "default"}
              icon={blog.isBookmarked ? <BookFilled /> : <BookOutlined />}
              onClick={handleBookmark}
            >
              {blog.isBookmarked ? "Đã lưu" : "Lưu"}
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default BlogDetailPage;
