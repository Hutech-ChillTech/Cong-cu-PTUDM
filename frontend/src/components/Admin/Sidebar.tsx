import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TagsOutlined,
  FolderOutlined,
  TeamOutlined,
  CreditCardOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import styles from "../../styles/AdminStyle.module.css";

const Sidebar: React.FC = () => {
  const menuItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
    {
      to: "/admin/course",
      label: "Khóa học",
      icon: <BookOutlined />,
    },
    {
      to: "/admin/blogs",
      label: "Blog",
      icon: <FileTextOutlined />,
    },
    {
      to: "/admin/tags",
      label: "Tags",
      icon: <TagsOutlined />,
    },
    {
      to: "/admin/categories",
      label: "Danh mục",
      icon: <FolderOutlined />,
    },
    {
      to: "/admin/users",
      label: "Học viên",
      icon: <TeamOutlined />,
    },
    {
      to: "/admin/payment-statistics",
      label: "Giao dịch",
      icon: <CreditCardOutlined />,
    },
    {
      to: "/admin/xp-statistics",
      label: "Thành tích",
      icon: <TrophyOutlined />,
    },
  ];

  return (
    <div
      className={`border-end bg-white ${styles["sidebar-wrapper"]}`}
      id={styles["sidebar-wrapper"]}
    >
      <div className={`text-center p-4 ${styles["sidebar-heading"]}`}>
        <img
          src="/images/SkillCoder_Logo.png"
          alt="Logo"
          style={{ width: 48, height: 48, objectFit: "contain" }}
        />
        <h6 className="mt-2 mb-0 fw-bold text-primary">SkillCoder</h6>
        <small className="text-muted">Admin Panel</small>
      </div>

      <div className="list-group list-group-flush px-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 ${
                isActive ? styles["active"] : ""
              }`
            }
          >
            <span className="fs-5">{item.icon}</span>
            <span className="fw-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
