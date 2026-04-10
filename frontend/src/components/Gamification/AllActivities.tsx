import React, { useEffect, useState } from "react";
import { Card, Spin, Empty, Timeline } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
  gamificationService,
  type UserStats,
} from "../../service/gamification.service";
import styles from "./AllActivities.module.css";

const AllActivities: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await gamificationService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to remove emojis from text
  const removeEmojis = (text: string): string => {
    return text
      .replace(
        // eslint-disable-next-line no-misleading-character-class
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\u{FE00}-\u{FE0F}]/gu,
        "",
      )
      .trim();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Đang tải hoạt động...</p>
      </div>
    );
  }

  if (!stats || stats.recentXP.length === 0) {
    return (
      <Card>
        <Empty description="Chưa có hoạt động nào" />
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.summaryCard}>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {stats.experiencePoints.toLocaleString()}
            </span>
            <span className={styles.summaryLabel}>Tổng XP</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{stats.recentXP.length}</span>
            <span className={styles.summaryLabel}>Hoạt động</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {stats.totalCoursesCompleted}
            </span>
            <span className={styles.summaryLabel}>Khóa học hoàn thành</span>
          </div>
        </div>
      </Card>

      <Card className={styles.timelineCard} style={{ marginTop: "1.5rem" }}>
        <Timeline
          mode="left"
          items={stats.recentXP.map((transaction) => ({
            dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
            color: "green",
            label: new Date(transaction.created_at).toLocaleDateString(
              "vi-VN",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            children: (
              <div className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>
                    {removeEmojis(transaction.description)}
                  </h4>
                  <span className={styles.activityXP}>
                    +{transaction.amount} XP
                  </span>
                </div>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
};

export default AllActivities;
