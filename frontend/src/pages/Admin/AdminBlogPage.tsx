import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag as AntTag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Switch,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { blogService } from "../../service/blog.service";
import { tagService } from "../../service/tag.service";
import { categoryService } from "../../service/category.service";
import type {
  BlogPost,
  Tag,
  Category,
  BlogPostTag,
  BlogStatus,
} from "../../types/blog.types";
import { slugify } from "../../utils/stringHelpers";
import "../../styles/AdminBlogPage.css";

const { TextArea } = Input;
const { Option } = Select;

const AdminBlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBlogs();
    fetchTags();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const result = await blogService.getBlogPosts({
        page: 1,
        limit: 100,
      });
      setBlogs(result.posts);
    } catch {
      message.error("Không thể tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagService.getAllTags();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setImageUrl("");
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setImageUrl(blog.coverImage || "");
    form.setFieldsValue({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      status: blog.status,
      tagIds: blog.tags?.map((t) => t.tag.tagId),
      categoryIds: blog.categories?.map((c) => c.category.categoryId),
      isFeatured: blog.isFeatured,
      isPinned: blog.isPinned,
    });
    setModalVisible(true);
  };

  const handleDelete = async (blogPostId: string) => {
    try {
      await blogService.deleteBlogPost(blogPostId);
      message.success("Đã xóa blog");
      fetchBlogs();
    } catch {
      message.error("Không thể xóa blog");
    }
  };

  const handleSubmit = async (values: {
    title: string;
    content: string;
    excerpt?: string;
    slug?: string;
    coverImage?: string;
    status?: string;
    tagIds?: string[];
    categoryIds?: string[];
    isFeatured?: boolean;
    isPinned?: boolean;
  }) => {
    try {
      console.log("Submitting blog data:", values);

      // Auto-generate slug from title if not provided
      const submitData = {
        ...values,
        slug: values.slug || slugify(values.title),
        status: values.status as BlogStatus | undefined,
      };

      console.log("Data with slug:", submitData);

      if (editingBlog) {
        await blogService.updateBlogPost(editingBlog.blogPostId, submitData);
        message.success("Đã cập nhật blog");
      } else {
        await blogService.createBlogPost(submitData);
        message.success("Đã tạo blog mới");
      }
      setModalVisible(false);
      fetchBlogs();
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string; error?: string } };
      };
      console.error("Error submitting blog:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Có lỗi xảy ra";
      message.error(errorMessage);
    }
  };

  const handlePublish = async (blogPostId: string) => {
    try {
      await blogService.publishBlogPost(blogPostId);
      message.success("Đã xuất bản blog");
      fetchBlogs();
    } catch {
      message.error("Không thể xuất bản blog");
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file ảnh!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      return false;
    }
    return true;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to your backend API
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/upload/image`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const uploadedUrl = data.url || data.data?.url;

      setImageUrl(uploadedUrl);
      form.setFieldsValue({ coverImage: uploadedUrl });
      message.success("Tải ảnh thành công!");

      if (onSuccess) onSuccess(data);
    } catch (error) {
      message.error("Không thể tải ảnh lên");
      if (onError) onError(error);
    } finally {
      setUploading(false);
    }
  };

  const columns: ColumnsType<BlogPost> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.isFeatured && <AntTag color="gold">Featured</AntTag>}
          {record.isPinned && <AntTag color="red">Pinned</AntTag>}
        </div>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: ["author", "userName"],
      key: "author",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colors = {
          DRAFT: "default",
          PUBLISHED: "success",
          ARCHIVED: "warning",
          SCHEDULED: "processing",
        };
        return (
          <AntTag color={colors[status as keyof typeof colors]}>
            {status}
          </AntTag>
        );
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (tags: BlogPostTag[]) => (
        <>
          {tags?.slice(0, 2).map((t) => (
            <AntTag key={t.tag.tagId}>{t.tag.name}</AntTag>
          ))}
          {tags?.length > 2 && <AntTag>+{tags.length - 2}</AntTag>}
        </>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 100,
      sorter: (a, b) => a.viewCount - b.viewCount,
    },
    {
      title: "Thích",
      dataIndex: "likeCount",
      key: "likeCount",
      width: 80,
      sorter: (a, b) => a.likeCount - b.likeCount,
    },
    {
      title: "Bình luận",
      dataIndex: "commentCount",
      key: "commentCount",
      width: 100,
      sorter: (a, b) => a.commentCount - b.commentCount,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/blog/${record.slug}`, "_blank")}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === "DRAFT" && (
            <Button
              type="link"
              onClick={() => handlePublish(record.blogPostId)}
            >
              Xuất bản
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc muốn xóa blog này?"
            onConfirm={() => handleDelete(record.blogPostId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-blog-page">
      <div className="page-header">
        <h1>Quản Lý Blog</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Tạo Blog Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blogs}
        rowKey="blogPostId"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
      />

      <Modal
        title={editingBlog ? "Chỉnh Sửa Blog" : "Tạo Blog Mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingBlog ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề blog" size="large" />
          </Form.Item>

          <Form.Item name="excerpt" label="Mô tả ngắn">
            <TextArea
              placeholder="Mô tả ngắn về blog (hiển thị trong danh sách)"
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea placeholder="Nội dung blog (hỗ trợ HTML)" rows={10} />
          </Form.Item>

          <Form.Item name="coverImage" label="Ảnh bìa">
            <Upload
              name="coverImage"
              listType="picture-card"
              className="cover-image-uploader"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              customRequest={handleUpload}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  preview={false}
                />
              ) : (
                <div>
                  {uploading ? (
                    <div>Đang tải...</div>
                  ) : (
                    <>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </>
                  )}
                </div>
              )}
            </Upload>
            {imageUrl && (
              <Button
                type="link"
                danger
                onClick={() => {
                  setImageUrl("");
                  form.setFieldsValue({ coverImage: "" });
                }}
                style={{ marginTop: 8 }}
              >
                Xóa ảnh
              </Button>
            )}
          </Form.Item>

          <Form.Item name="categoryIds" label="Danh mục">
            <Select mode="multiple" placeholder="Chọn danh mục" allowClear>
              {categories.map((cat) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tagIds" label="Tags">
            <Select
              mode="multiple"
              placeholder="Chọn tags"
              allowClear
              showSearch
              filterOption={(input, option) => {
                const children = option?.children as React.ReactNode;
                if (typeof children === "string") {
                  return children.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {tags.map((tag) => (
                <Option key={tag.tagId} value={tag.tagId}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="DRAFT">
            <Select>
              <Option value="DRAFT">Nháp</Option>
              <Option value="PUBLISHED">Xuất bản</Option>
              <Option value="ARCHIVED">Lưu trữ</Option>
            </Select>
          </Form.Item>

          <Space>
            <Form.Item
              name="isFeatured"
              label="Featured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item name="isPinned" label="Ghim" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBlogPage;
