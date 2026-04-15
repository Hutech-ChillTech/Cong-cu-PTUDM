import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Input,
  Tag,
  Card,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchService } from "../../service/search.service";
import { tagService } from "../../service/tag.service";
import BlogCard from "../../components/BlogCard/BlogCard";
import type {
  Tag as TagType,
  BlogPost,
  CourseSearchResult,
} from "../../types/blog.types";
import "../../styles/SearchPage.css";

const { Title, Text } = Typography;

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tag")?.split(",").filter(Boolean) || [],
  );
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [courses, setCourses] = useState<CourseSearchResult[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) {
      setSelectedTags([tag]);
      handleSearch();
    }
  }, [searchParams]);

  const fetchTags = async () => {
    try {
      const tags = await tagService.getITTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && selectedTags.length === 0) {
      return;
    }

    try {
      setLoading(true);

      if (selectedTags.length === 1 && !searchQuery) {
        // Search by single tag
        const result = await searchService.searchAllByTag(selectedTags[0]);
        setCourses(result.courses || []);
        setBlogs(result.blogs || []);
      } else {
        // Advanced search
        const result = await searchService.advancedSearch({
          query: searchQuery,
          tagSlugs: selectedTags,
          take: 50,
        });
        setCourses(result.courses || []);
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tagSlug: string) => {
    if (!selectedTags.includes(tagSlug)) {
      setSelectedTags([...selectedTags, tagSlug]);
    }
  };

  const removeTag = (tagSlug: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagSlug));
  };

  const clearAll = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setCourses([]);
    setBlogs([]);
  };

  const totalResults = courses.length + blogs.length;

  return (
    <div className="search-page-redesign">
      {/* Header */}
      <div className="search-header-clean">
        <Title level={2}>🔍 Tìm Kiếm Khóa Học & Blog</Title>

        {/* Search Bar */}
        <div className="search-bar-container">
          <Input.Search
            size="large"
            placeholder="Tìm kiếm khóa học, công nghệ, bài viết..."
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            enterButton="Tìm kiếm"
            loading={loading}
          />

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <Space wrap style={{ marginTop: 16 }}>
              {selectedTags.map((tagSlug) => {
                const tag = allTags.find((t) => t.slug === tagSlug);
                return (
                  <Tag
                    key={tagSlug}
                    closable
                    onClose={() => removeTag(tagSlug)}
                    color="blue"
                  >
                    {tag?.name || tagSlug}
                  </Tag>
                );
              })}
              <a onClick={clearAll}>Xóa tất cả</a>
            </Space>
          )}
        </div>

        {/* Results Count */}
        {totalResults > 0 && (
          <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
            {totalResults} kết quả
          </Text>
        )}
      </div>

      {/* Popular Tags */}
      {allTags.length > 0 && (
        <div
          style={{ maxWidth: 1200, margin: "0 auto 40px", textAlign: "center" }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Tags phổ biến:
          </Text>
          <Space wrap>
            {allTags.slice(0, 15).map((tag) => (
              <Tag
                key={tag.tagId}
                color={selectedTags.includes(tag.slug) ? "blue" : "default"}
                style={{ cursor: "pointer" }}
                onClick={() => handleTagSelect(tag.slug)}
              >
                {tag.name}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Spin size="large" />
        </div>
      )}

      {/* Results */}
      {!loading && totalResults > 0 && (
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Courses */}
          {courses.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <Title level={3} style={{ marginBottom: 24 }}>
                📚 Khóa học ({courses.length})
              </Title>
              <Row gutter={[24, 24]}>
                {courses.map((course) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={course.courseId}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/course/${course.courseId}`)}
                      className="course-card-vertical"
                      cover={
                        <div
                          style={{
                            height: 180,
                            background: course.avatarURL
                              ? `url(${course.avatarURL}) center/cover`
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 24,
                            fontWeight: 700,
                          }}
                        >
                          {!course.avatarURL &&
                            (course.courseName?.substring(0, 2) || "CO")}
                        </div>
                      }
                    >
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        <Title
                          level={4}
                          ellipsis={{ tooltip: course.courseName }}
                          style={{ margin: 0 }}
                        >
                          {course.courseName}
                        </Title>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          {(course.coursePrice ?? 0) > 0
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(course.coursePrice ?? 0)
                            : "Miễn phí"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Trình độ: {course.level || "Basic"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {course._count?.enrollments || 0} học viên
                        </Text>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Button size="small" style={{ flex: 1 }}>
                            Xem
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            style={{ flex: 1 }}
                          >
                            Mua ngay
                          </Button>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Blogs */}
          {blogs.length > 0 && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                📝 Bài viết ({blogs.length})
              </Title>
              <Row gutter={[24, 24]}>
                {blogs.map((blog) => (
                  <Col xs={24} sm={12} lg={8} key={blog.blogPostId}>
                    <BlogCard blog={blog} />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        totalResults === 0 &&
        (searchQuery || selectedTags.length > 0) && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Empty
              description={
                <div>
                  <Title level={3} type="secondary">
                    Không tìm thấy kết quả
                  </Title>
                  <Text type="secondary">
                    Thử tìm kiếm với từ khóa khác hoặc chọn tags khác
                  </Text>
                </div>
              }
            />
          </div>
        )}

      {/* Initial State */}
      {!loading &&
        totalResults === 0 &&
        !searchQuery &&
        selectedTags.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Title level={3} type="secondary">
              👋 Nhập từ khóa để tìm kiếm
            </Title>
            <Text type="secondary">
              Tìm kiếm khóa học, bài viết, công nghệ, hoặc chọn tags phía trên
            </Text>
          </div>
        )}
    </div>
  );
};

export default SearchPage;
