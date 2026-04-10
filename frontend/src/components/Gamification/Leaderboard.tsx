import React, { useEffect, useState } from "react";
import { Card, Avatar, Badge, Spin, Empty, Select } from "antd";
import {
  gamificationService,
  type LeaderboardUser,
} from "../../service/gamification.service";
import styles from "./Leaderboard.module.css";

const { Option } = Select;

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard(100); // Lấy nhiều hơn để filter
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter leaderboard by level
  const filteredLeaderboard = selectedLevel === "all"
    ? leaderboard
    : leaderboard.filter(user => user.level === selectedLevel);

  // Re-rank after filtering
  const rankedLeaderboard = filteredLeaderboard.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className={styles.goldMedal}>#1</span>;
      case 2:
        return <span className={styles.silverMedal}>#2</span>;
      case 3:
        return <span className={styles.bronzeMedal}>#3</span>;
      default:
        return <span className={styles.rank}>#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "#52c41a";
      case "Intermediate":
        return "#1890ff";
      case "Advanced":
        return "#722ed1";
      default:
        return "#8c8c8c";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "Basic":
        return "Cơ bản";
      case "Intermediate":
        return "Trung cấp";
      case "Advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Đang tải bảng xếp hạng...
        </p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className={styles.leaderboardCard}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có dữ liệu bảng xếp hạng"
        />
      </Card>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      {/* Level Filter */}
      <div className={styles.filterSection}>
        <label style={{ marginRight: 12, fontWeight: 500 }}>
          Lọc theo cấp độ:
        </label>
        <Select
          value={selectedLevel}
          onChange={setSelectedLevel}
          style={{ width: 200 }}
          size="large"
        >
          <Option value="all">Tất cả</Option>
          <Option value="Basic">Cơ bản</Option>
          <Option value="Intermediate">Trung cấp</Option>
          <Option value="Advanced">Nâng cao</Option>
        </Select>
        <span style={{ marginLeft: 16, color: "#666" }}>
          {rankedLeaderboard.length} học viên
        </span>
      </div>

      <div className={styles.listSection}>
        {rankedLeaderboard.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`Không có học viên nào ở cấp độ ${getLevelLabel(selectedLevel)}`}
          />
        ) : (
          rankedLeaderboard.map((user) => (
            <div
              key={user.userId}
              className={`${styles.listItem} ${
                user.rank <= 3 ? styles.topThree : ""
              } ${user.rank === 1 ? styles.firstPlace : ""}`}
            >
              <div className={styles.rankSection}>{getRankIcon(user.rank)}</div>
              <Avatar
                src={user.avatarURL || "/images/default-avatar.png"}
                size={50}
                className={styles.userAvatar}
              />
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.userName}</span>
                <Badge
                  count={getLevelLabel(user.level)}
                  style={{
                    backgroundColor: getLevelColor(user.level),
                    fontSize: "0.75rem",
                  }}
                />
              </div>
              <div className={styles.xpSection}>
                <span className={styles.xpAmount}>
                  {user.totalXP.toLocaleString()}
                </span>
                <span className={styles.xpLabel}>XP</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
