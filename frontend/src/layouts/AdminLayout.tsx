import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar";
import Header from "../components/Admin/Header";
import PageTransition from "../components/PageTransition/PageTransition";
import styles from "../styles/AdminStyle.module.css";

const AdminLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="d-flex" id={styles.wrapper}>
      {sidebarVisible && <Sidebar />}
      <div id={styles["page-content-wrapper"]} className="flex-grow-1">
        <Header
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          collapsed={!sidebarVisible}
        />
        <div className="container-fluid mt-4">
          <PageTransition>
            <Outlet /> {/* Route con sẽ render ở đây */}
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
