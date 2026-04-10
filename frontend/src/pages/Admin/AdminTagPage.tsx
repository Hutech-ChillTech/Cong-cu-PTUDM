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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { tagService } from "../../service/tag.service";
import type { Tag } from "../../types/blog.types";
import "../../styles/AdminTagPage.css";

const { Option } = Select;

const AdminTagPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    filterTags();
  }, [tags, searchText, typeFilter]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getAllTags();
      setTags(data);
    } catch {
      message.error("Không thể tải danh sách tags");
    } finally {
      setLoading(false);
    }
  };

  const filterTags = () => {
    let filtered = [...tags];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchText.toLowerCase()) ||
          tag.slug.toLowerCase().includes(searchText.toLowerCase()) ||
          tag.description?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Filter by type
    if (typeFilter) {
      filtered = filtered.filter((tag) => tag.type === typeFilter);
    }

    setFilteredTags(filtered);
  };

  const handleCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      description: tag.description,
      type: tag.type,
    });
    setModalVisible(true);
  };

  const handleDelete = async (tagId: string) => {
    try {
      await tagService.deleteTag(tagId);
      message.success("Đã xóa tag");
      fetchTags();
    } catch {
      message.error("Không thể xóa tag");
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    type: string;
  }) => {
    try {
      const submitValues = {
        ...values,
        type: values.type as "COURSE" | "BLOG" | "GENERAL",
      };
      if (editingTag) {
        await tagService.updateTag(editingTag.tagId, submitValues);
        message.success("Đã cập nhật tag");
      } else {
        await tagService.createTag(submitValues);
        message.success("Đã tạo tag mới");
      }
      setModalVisible(false);
      fetchTags();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "COURSE":
        return "blue";
      case "BLOG":
        return "green";
      case "GENERAL":
        return "purple";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Tag> = [
    {
      title: "Tên nhãn",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 150,
      render: (text) => <code>{text}</code>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || <span style={{ color: "#ccc" }}>-</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => <AntTag color={getTypeColor(type)}>{type}</AntTag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa tag này?"
            description="Tất cả liên kết với courses và blogs sẽ bị xóa!"
            onConfirm={() => handleDelete(record.tagId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
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
    <div className="admin-tag-page">
      <div className="page-header">
        <h1>Quản Lý Nhãn</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Tạo Nhãn Mới
        </Button>
      </div>

      {/* Filters */}
      <div className="filters">
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm kiếm tag..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo type"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="COURSE">COURSE</Option>
            <Option value="BLOG">BLOG</Option>
            <Option value="GENERAL">GENERAL</Option>
          </Select>
          <div style={{ color: "#666" }}>
            Tổng: <strong>{filteredTags.length}</strong> nhãn
          </div>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTags}
        rowKey="tagId"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhãn`,
        }}
      />

      <Modal
        title={editingTag ? "Chỉnh Sửa Nhãn" : "Tạo Nhãn Mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        okText={editingTag ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Nhãn"
            rules={[{ required: true, message: "Vui lòng nhập tên nhãn" }]}
          >
            <Input placeholder="VD: Node.js, React, Python" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả ngắn về nhãn" rows={3} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            initialValue="GENERAL"
            rules={[{ required: true, message: "Vui lòng chọn type" }]}
          >
            <Select size="large">
              <Option value="COURSE">COURSE - Dành cho khóa học</Option>
              <Option value="BLOG">BLOG - Dành cho blog</Option>
              <Option value="GENERAL">GENERAL - Dùng chung</Option>
            </Select>
          </Form.Item>

          <div className="form-hint">
            <strong>Lưu ý:</strong> Slug sẽ được tự động tạo từ tên tag. VD:
            "Node.js" → "nodejs"
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTagPage;
