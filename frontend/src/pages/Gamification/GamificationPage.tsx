import React from "react";
import { Tabs } from "antd";
import UserStatsCard from "../../components/Gamification/UserStatsCard";
import Leaderboard from "../../components/Gamification/Leaderboard";
import AllAchievements from "../../components/Gamification/AllAchievements";
import AllActivities from "../../components/Gamification/AllActivities";
import styles from "../../styles/GamificationPage.module.css";

const GamificationPage: React.FC = () => {
  const items = [
    {
      key: "stats",
      label: "Thống kê của tôi",
      children: <UserStatsCard />,
    },
    {
      key: "achievements",
      label: "Thành tích",
      children: <AllAchievements />,
    },
    {
      key: "activities",
      label: "Hoạt động",
      children: <AllActivities />,
    },
    {
      key: "leaderboard",
      label: "Bảng xếp hạng",
      children: <Leaderboard />,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Thành tích</h1>
        <p className={styles.subtitle}>
          Theo dõi tiến độ học tập và so sánh với các học viên khác
        </p>
      </div>

      <div className={styles.content}>
        <Tabs
          items={items}
          defaultActiveKey="stats"
          className={styles.gamificationTabs}
          size="large"
        />
      </div>
    </div>
  );
};

export default GamificationPage;
