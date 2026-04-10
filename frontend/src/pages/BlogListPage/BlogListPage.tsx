import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Pagination,
  Select,
  Space,
  Typography,
  Skeleton,
  Empty,
  message,
  Divider,
  Collapse,
} from 'antd';
import {
  FireOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { blogService } from '../../service/blog.service';
import { categoryService } from '../../service/category.service';
import BlogCard from '../../components/BlogCard/BlogCard';
import TagCloud from '../../components/TagCloud/TagCloud';
import type { BlogPost, Category } from '../../types/blog.types';
import '../../styles/BlogListPage.css';

const { Text } = Typography;
const { Option } = Select;

const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'trending'>('new');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, selectedCategory, selectedTag, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getPopularCategories(10);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const data = await blogService.getFeaturedPosts(3);
      setFeaturedBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      setFeaturedBlogs([]);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const result = await blogService.getBlogPosts({
        page: currentPage,
        limit: pageSize,
        status: 'PUBLISHED',
        category: selectedCategory,
        tag: selectedTag,
        sort: sortBy,
      });
      setBlogs(Array.isArray(result?.posts) ? result.posts : []);
      setTotal(result?.total || 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      message.error('Không thể tải danh sách blog');
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId);
    setCurrentPage(1);
  };

  const handleTagClick = (tagSlug: string) => {
    setSelectedTag(tagSlug);
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'new' | 'popular' | 'trending') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="blog-list-page">
      {/* Header */}
      <div className="blog-header">
        <h1>Blog</h1>
        <p>
          Khám phá những bài viết hữu ích về lập trình, công nghệ và kinh nghiệm thực tế
        </p>
      </div>

      <Row gutter={[24, 24]} style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        {/* Main Content */}
        <Col xs={24} lg={18}>
          {/* Featured Blogs */}
          {featuredBlogs.length > 0 && (
            <Card
              className="featured-section"
              title={
                <Space>
                  <FireOutlined />
                  <span>Bài Viết Nổi Bật</span>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                {featuredBlogs.map((blog) => (
                  <Col xs={24} md={8} key={blog.blogPostId}>
                    <BlogCard blog={blog} showExcerpt={false} />
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Sort & Filter Bar */}
          <Card style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Text strong>Sắp xếp:</Text>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    style={{ width: 150 }}
                  >
                    <Option value="new">
                      <Space>
                        Mới nhất
                      </Space>
                    </Option>
                    <Option value="popular">
                      <Space>
                        Phổ biến
                      </Space>
                    </Option>
                    <Option value="trending">
                      <Space>
                        Trending
                      </Space>
                    </Option>
                  </Select>
                </Space>
              </Col>
              <Col>
                <Text type="secondary">
                  Tìm thấy <strong>{total}</strong> bài viết
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Blog Grid */}
          {loading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col xs={24} sm={12} lg={8} key={i}>
                  <Card>
                    <Skeleton active avatar paragraph={{ rows: 4 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : blogs.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>Không tìm thấy bài viết nào</Text>
                    <Text type="secondary">
                      Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                    </Text>
                  </Space>
                }
              />
            </Card>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {blogs.map((blog) => (
                  <Col xs={24} sm={12} lg={8} key={blog.blogPostId}>
                    <BlogCard blog={blog} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {total > pageSize && (
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} bài viết`}
                  />
                </div>
              )}
            </>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={6}>
          <Collapse
            defaultActiveKey={['categories', 'tags']}
            ghost
            style={{ background: 'transparent' }}
          >
            {/* Categories Panel */}
            <Collapse.Panel
              header={
                <Space>
                  <AppstoreOutlined />
                  <span style={{ fontWeight: 600 }}>Danh Mục</span>
                </Space>
              }
              key="categories"
              className="sidebar-collapse-panel"
            >
              <Card className="sidebar-card" bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* Clear All Button */}
                  <a
                    className={!selectedCategory ? 'category-link active' : 'category-link'}
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setCurrentPage(1);
                    }}
                    style={{ 
                      background: !selectedCategory ? 'linear-gradient(90deg, var(--accent-blue1), var(--accent-blue2))' : '#f0f0f0',
                      color: !selectedCategory ? 'white' : '#333',
                      fontWeight: !selectedCategory ? 600 : 400,
                    }}
                  >
                    Tất cả danh mục
                  </a>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  {/* Category List */}
                  {categories.map((cat) => (
                    <a
                      key={cat.categoryId}
                      onClick={() => handleCategoryChange(cat.categoryId)}
                      className={
                        selectedCategory === cat.categoryId
                          ? 'category-link active'
                          : 'category-link'
                      }
                    >
                      {cat.name}
                    </a>
                  ))}
                </Space>
              </Card>
            </Collapse.Panel>

            {/* Tags Panel */}
            <Collapse.Panel
              header={
                <Space>
                  <TagsOutlined />
                  <span style={{ fontWeight: 600 }}>Tags Phổ Biến</span>
                </Space>
              }
              key="tags"
              className="sidebar-collapse-panel"
            >
              <Card className="sidebar-card" bordered={false}>
                <TagCloud
                  limit={15}
                  onTagClick={(tag) => handleTagClick(tag.slug)}
                />
              </Card>
            </Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default BlogListPage;
