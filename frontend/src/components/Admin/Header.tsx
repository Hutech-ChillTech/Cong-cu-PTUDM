import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Space,
  Input,
  Typography,
  Modal,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { jwtDecode } from "jwt-decode";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onToggleSidebar: () => void;
  collapsed?: boolean;
}

interface DecodedToken {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  exp?: number;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, collapsed }) => {
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({
    name: "",
    email: "",
  });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserInfo({
          name: decoded.name,
          email: decoded.email,
        });
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    console.log("Menu clicked:", e.key);
    if (e.key === "logout") {
      handleLogout();
    }
    // TODO: Handle other menu items
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Đổi mật khẩu",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 999,
        height: 64,
      }}
    >
      {/* Left side - Toggle button and title */}
      <Space size="large">
        <Button
          type="primary"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{
            fontSize: "18px",
            width: 40,
            height: 40,
          }}
        />
        <Text strong style={{ fontSize: 16 }}>
          Quản trị hệ thống
        </Text>
      </Space>

      {/* Right side - Search, Notifications, User menu */}
      <Space size="middle">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          allowClear
        />

       

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <Space
            style={{ cursor: "pointer", padding: "4px 8px" }}
            align="center"
          >
            <div style={{ textAlign: "center" }}>
              <Text strong style={{ fontSize: 14, display: "block" }}>
                {userInfo.name || "Admin"}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                {userInfo.email || "admin@hutech.edu.vn"}
              </Text>
            </div>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
          </Space>
        </Dropdown>
      </Space>

      {/* Custom Logout Modal */}
      <Modal
        open={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        footer={null}
        centered
        width={400}
        closable={false}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fff2e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <LogoutOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Xác nhận đăng xuất
          </h3>
          <p style={{ color: "#8c8c8c", marginBottom: 24 }}>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </p>
          <Space size="middle">
            <Button
              size="large"
              onClick={() => setLogoutModalVisible(false)}
              style={{ minWidth: 100 }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              onClick={confirmLogout}
              style={{ minWidth: 100 }}
            >
              Đăng xuất
            </Button>
          </Space>
        </div>
      </Modal>
    </AntHeader>
  );
};

export default Header;
