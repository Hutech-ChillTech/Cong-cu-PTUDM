import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  TreeSelect,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { categoryService } from "../../service/category.service";
import type { Category } from "../../types/blog.types";
import "../../styles/AdminCategoryPage.css";

const AdminCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch {
      message.error("Không thể tải danh sách categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      orderIndex: category.orderIndex,
    });
    setModalVisible(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      message.success("Đã xóa category");
      fetchCategories();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "Không thể xóa category");
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    parentId?: string;
    orderIndex?: number;
  }) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory.categoryId,
          values,
        );
        message.success("Đã cập nhật category");
      } else {
        await categoryService.createCategory(values);
        message.success("Đã tạo category mới");
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Build tree data for parent selection
  interface TreeNode {
    title: string;
    value: string;
    children: TreeNode[];
    disabled: boolean;
  }

  const buildTreeData = (
    categories: Category[],
    parentId: string | null = null,
  ): TreeNode[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((cat) => ({
        title: cat.name,
        value: cat.categoryId,
        children: buildTreeData(categories, cat.categoryId),
        disabled: editingCategory?.categoryId === cat.categoryId, // Can't select self as parent
      }));
  };

  // Build hierarchical table data
  const buildTableData = (
    categories: Category[],
    parentId: string | null = null,
    level: number = 0,
  ): (Category & { level: number })[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .flatMap((cat) => [
        { ...cat, level },
        ...buildTableData(categories, cat.categoryId, level + 1),
      ]);
  };

  const tableData = buildTableData(categories);

  const columns: ColumnsType<Category & { level: number }> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text, record) => (
        <div style={{ paddingLeft: record.level * 30 }}>
          <Space>
            {record.level > 0 && <span style={{ color: "#ccc" }}>└─</span>}
            {record.parentId ? (
              <FolderOutlined style={{ color: "#1890ff" }} />
            ) : (
              <FolderOpenOutlined style={{ color: "#52c41a" }} />
            )}
            <strong>{text}</strong>
          </Space>
        </div>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 200,
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
      title: "Thứ tự",
      dataIndex: "orderIndex",
      key: "orderIndex",
      width: 100,
      render: (order) => <Tag>{order || 0}</Tag>,
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
            title="Bạn có chắc muốn xóa category này?"
            description="Tất cả liên kết sẽ bị xóa!"
            onConfirm={() => handleDelete(record.categoryId)}
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
    <div className="admin-category-page">
      <div className="page-header">
        <h1>Quản Lý Danh mục</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Tạo Danh mục Mới
        </Button>
      </div>

      <div className="stats-bar">
        <Space size="large">
          <div>
            <strong>Tổng Danh mục:</strong> {categories.length}
          </div>
          <div>
            <strong>Danh mục gốc:</strong>{" "}
            {categories.filter((c) => !c.parentId).length}
          </div>
          <div>
            <strong>Danh mục con:</strong>{" "}
            {categories.filter((c) => c.parentId).length}
          </div>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="categoryId"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 50,
          showTotal: (total) => `Tổng ${total} danh mục`,
        }}
      />

      <Modal
        title={editingCategory ? "Chỉnh Sửa Danh mục" : "Tạo Danh mục Mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        okText={editingCategory ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input
              placeholder="VD: Tutorial, News, Best Practices"
              size="large"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả ngắn về category" rows={3} />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <TreeSelect
              placeholder="Chọn parent (để trống = root)"
              treeData={[
                { title: "(Root - Không có parent)", value: "" },
                ...buildTreeData(categories),
              ]}
              allowClear
              size="large"
            />
          </Form.Item>

          <Form.Item name="orderIndex" label="Thứ tự" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              size="large"
              placeholder="0"
            />
          </Form.Item>

          <div className="form-hint">
            <strong>Lưu ý:</strong>
            <ul>
              <li>Slug sẽ được tự động tạo từ tên danh mục</li>
              <li>Thứ tự nhỏ hơn sẽ hiển thị trước</li>
              <li>Không thể xóa danh mục có children</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoryPage;
