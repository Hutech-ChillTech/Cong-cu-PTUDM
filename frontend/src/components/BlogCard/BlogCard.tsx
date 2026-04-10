import React from 'react';
import { Card, Tag, Avatar, Typography } from 'antd';
import {
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { BlogPost } from '../../types/blog.types';
import './BlogCard.css';

const { Text, Paragraph } = Typography;

interface BlogCardProps {
  blog: BlogPost;
  showExcerpt?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, showExcerpt = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${blog.slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      hoverable
      className="blog-card"
      onClick={handleClick}
      cover={
        <div className="blog-card-image">
          {blog.coverImage ? (
            <img alt={blog.title} src={blog.coverImage} />
          ) : (
            <div className="blog-card-placeholder">
              <FileTextOutlined style={{ fontSize: '48px', color: '#999' }} />
            </div>
          )}
          
          {/* Badges */}
          <div className="blog-card-badges">
            {blog.isFeatured && (
              <span className="blog-card-badge featured">
                Featured
              </span>
            )}
            {blog.isPinned && (
              <span className="blog-card-badge pinned">
                Pinned
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="blog-card-content">
        {/* Title */}
        <h3 className="blog-card-title">{blog.title}</h3>

        {/* Meta Info */}
        <div className="blog-card-meta">
          <div className="blog-card-meta-item">
            <Avatar
              src={blog.author?.avatarURL}
              size="small"
              icon={<UserOutlined />}
            />
            <Text>{blog.author?.userName || 'Anonymous'}</Text>
          </div>
          <div className="blog-card-meta-item">
            <Text type="secondary">
              {formatDate(blog.publishedAt || blog.created_at)}
            </Text>
          </div>
        </div>

        {/* Excerpt */}
        {showExcerpt && blog.excerpt && (
          <Paragraph className="blog-card-excerpt">
            {blog.excerpt}
          </Paragraph>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-card-tags">
            {blog.tags.slice(0, 3).map((blogTag) => (
              <Tag
                key={blogTag.tag.tagId}
                className="blog-card-tag"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/search?tag=${blogTag.tag.slug}`);
                }}
              >
                {blogTag.tag.name}
              </Tag>
            ))}
            {blog.tags.length > 3 && (
              <Tag className="blog-card-tag">+{blog.tags.length - 3}</Tag>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="blog-card-stats">
          <div className="blog-card-stats-item">
            <EyeOutlined />
            <Text>{blog.viewCount}</Text>
          </div>
          <div className="blog-card-stats-item">
            <LikeOutlined />
            <Text>{blog.likeCount}</Text>
          </div>
          <div className="blog-card-stats-item">
            <CommentOutlined />
            <Text>{blog.commentCount}</Text>
          </div>
          {blog.readingTime && (
            <div className="blog-card-reading-time">
              <ClockCircleOutlined />
              <Text>{blog.readingTime} phút</Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;
