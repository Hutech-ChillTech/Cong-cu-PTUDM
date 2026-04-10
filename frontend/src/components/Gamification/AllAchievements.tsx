import React, { useEffect, useState } from "react";
import { Card, Badge, Spin, Empty, Row, Col } from "antd";
import { gamificationService, type UserStats, type Achievement, type UserAchievement } from "../../service/gamification.service";
import styles from "./AllAchievements.module.css";

interface MergedAchievement {
  achievement: Achievement;
  userAchievement: UserAchievement | null;
  isUnlocked: boolean;
}

const AllAchievements: React.FC = () => {
  const [allAchievements, setAllAchievements] = useState<MergedAchievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // Lấy cả 2: tất cả achievements của hệ thống và achievements của user
      const [systemAchievements, userStats] = await Promise.all([
        gamificationService.getAllAchievements(),
        gamificationService.getUserStats(),
      ]);

      setStats(userStats);

      // Merge system achievements với user achievements
      const merged: MergedAchievement[] = systemAchievements.map((achievement) => {
        const userAchievement = userStats.achievements.list.find(
          (ua) => ua.achievementId === achievement.achievementId
        );
        
        return {
          achievement,
          userAchievement: userAchievement || null,
          isUnlocked: !!userAchievement,
        };
      });

      setAllAchievements(merged);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "#52c41a";
      case "rare":
        return "#1890ff";
      case "epic":
        return "#722ed1";
      case "legendary":
        return "#fa8c16";
      default:
        return "#8c8c8c";
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Đang tải thành tích...</p>
      </div>
    );
  }

  if (!stats || allAchievements.length === 0) {
    return (
      <Card>
        <Empty description="Chưa có thành tích nào" />
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.summaryCard}>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{stats.achievements.unlocked}</span>
            <span className={styles.summaryLabel}>Đã mở khóa</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{allAchievements.length}</span>
            <span className={styles.summaryLabel}>Tổng thành tích</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {Math.round((stats.achievements.unlocked / allAchievements.length) * 100)}%
            </span>
            <span className={styles.summaryLabel}>Hoàn thành</span>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: '1.5rem' }}>
        {allAchievements.map((merged) => {
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={merged.achievement.achievementId}>
              <Card 
                className={`${styles.achievementCard} ${!merged.isUnlocked ? styles.locked : ''}`}
                hoverable={merged.isUnlocked}
              >
                <div className={styles.achievementIcon}>
                  {merged.achievement.icon.startsWith('/') || 
                   merged.achievement.icon.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) ? (
                    <img 
                      src={merged.achievement.icon} 
                      alt={merged.achievement.name}
                      className={styles.iconImage}
                    />
                  ) : (
                    <span className={styles.iconEmoji}>{merged.achievement.icon}</span>
                  )}
                  {!merged.isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
                </div>
                
                <h3 className={styles.achievementName}>
                  {merged.achievement.name}
                </h3>
                
                <p className={styles.achievementDescription}>
                  {merged.achievement.description}
                </p>
                
                <div className={styles.achievementFooter}>
                  <Badge
                    count={merged.achievement.rarity}
                    style={{
                      backgroundColor: getRarityColor(merged.achievement.rarity),
                      fontSize: "0.7rem",
                      textTransform: "capitalize",
                    }}
                  />
                  {merged.isUnlocked && merged.userAchievement?.unlockedAt && (
                    <span className={styles.unlockedDate}>
                      {new Date(merged.userAchievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AllAchievements;
