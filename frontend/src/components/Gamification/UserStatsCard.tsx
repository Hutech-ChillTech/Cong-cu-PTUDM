import React, { useEffect, useState } from "react";
import { Spin, Progress, Card, Badge, Button, Modal } from "antd";
import { TrophyOutlined, RocketOutlined } from "@ant-design/icons";
import {
  gamificationService,
  type UserStats,
} from "../../service/gamification.service";
import styles from "./UserStatsCard.module.css";

const UserStatsCard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await gamificationService.getUserStats();
      console.log("Gamification stats loaded:", data);
      setStats(data);
      setError(null);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Error loading gamification stats:", error);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải dữ liệu gamification",
      );
    } finally {
      setLoading(false);
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
      <Card>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h3 style={{ color: "#f56565", marginBottom: "0.5rem" }}>
            Lỗi tải dữ liệu
          </h3>
          <p style={{ color: "#666", marginBottom: "1rem" }}>{error}</p>
          <button
            onClick={loadStats}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Thử lại
          </button>
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#fef3c7",
              borderRadius: "8px",
              textAlign: "left",
            }}
          ></div>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.statsContainer}>
      {/* User Header with Gradient Background */}
      <Card className={styles.headerCard}>
        <div className={styles.userHeader}>
          <div className={styles.avatarWrapper}>
            <img
              src={stats.avatarURL || "/images/default-avatar.png"}
              alt={stats.userName}
              className={styles.avatar}
            />
            <div
              className={styles.levelBadgeOverlay}
              style={{ backgroundColor: getLevelColor(stats.level) }}
            >
              {stats.levelInfo.perks.badge.startsWith("/") ||
              stats.levelInfo.perks.badge.match(
                /\.(png|jpg|jpeg|gif|svg|webp)$/i,
              ) ? (
                <img
                  src={stats.levelInfo.perks.badge}
                  alt="Badge"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.textContent = "";
                    }
                  }}
                />
              ) : (
                stats.levelInfo.perks.badge
              )}
            </div>
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{stats.userName}</h2>
            <div className={styles.levelTag}>
              <span className={styles.levelText}>{stats.level}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* XP Section */}
      <Card
        className={styles.xpCard}
        title={
          <>
            <RocketOutlined /> Experience Points
          </>
        }
      >
        <div className={styles.xpSection}>
          <p className={styles.xpTotal}>
            {stats.experiencePoints.toLocaleString()} XP
          </p>

          <div className={styles.levelProgress}>
            <Progress
              percent={stats.levelProgress}
              strokeColor={{
                from: getLevelColor(stats.level),
                to: getLevelColor(stats.levelInfo.nextLevel || stats.level),
              }}
              showInfo={false}
              strokeWidth={12}
            />
            <p className={styles.progressText}>
              {stats.currentLevelXP.toLocaleString()} /{" "}
              {stats.nextLevelXP.toLocaleString()} XP đến{" "}
              {stats.levelInfo.nextLevel || "Max Level"}
            </p>
          </div>

          {stats.levelInfo.perks.discount > 0 && (
            <div className={styles.perks}>
              <p>{stats.levelInfo.perks.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Achievements Section */}
      <Card
        className={styles.achievementsCard}
        title={
          <>
            <TrophyOutlined /> Thành tích
          </>
        }
        extra={
          stats.achievements.list.length > 3 && (
            <Button type="link" onClick={() => setShowAllAchievements(true)}>
              Xem tất cả
            </Button>
          )
        }
      >
        <div className={styles.achievementsSection}>
          <p className={styles.achievementsSummary}>
            <strong>
              {stats.achievements.unlocked} / {stats.achievements.total}
            </strong>{" "}
            đã mở khóa
          </p>

          <div className={styles.achievementGrid}>
            {stats.achievements.list.slice(0, 9).map((userAchievement) => (
              <div
                key={userAchievement.id}
                className={styles.achievementBadge}
                title={userAchievement.achievement.description}
              >
                <div className={styles.achievementIconWrapper}>
                  <span className={styles.achievementIcon}>
                    {userAchievement.achievement.icon.startsWith("/") ||
                    userAchievement.achievement.icon.match(
                      /\.(png|jpg|jpeg|gif|svg|webp)$/i,
                    ) ? (
                      <img
                        src={userAchievement.achievement.icon}
                        alt={userAchievement.achievement.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          // Fallback to trophy emoji if image fails to load
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.textContent = "";
                          }
                        }}
                      />
                    ) : (
                      userAchievement.achievement.icon
                    )}
                  </span>
                </div>
                <p className={styles.achievementName}>
                  {userAchievement.achievement.name}
                </p>
                <Badge
                  count={userAchievement.achievement.rarity}
                  style={{
                    backgroundColor: getRarityColor(
                      userAchievement.achievement.rarity,
                    ),
                    fontSize: "0.7rem",
                    textTransform: "capitalize",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* All Achievements Modal */}
      <Modal
        title={`Tất cả thành tích (${stats.achievements.unlocked}/${stats.achievements.total})`}
        open={showAllAchievements}
        onCancel={() => setShowAllAchievements(false)}
        footer={null}
        width={800}
      >
        <div
          className={styles.achievementGrid}
          style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
        >
          {stats.achievements.list.map((userAchievement) => (
            <div
              key={userAchievement.id}
              className={styles.achievementBadge}
              title={userAchievement.achievement.description}
            >
              <div className={styles.achievementIconWrapper}>
                <span className={styles.achievementIcon}>
                  {userAchievement.achievement.icon.startsWith("/") ||
                  userAchievement.achievement.icon.match(
                    /\.(png|jpg|jpeg|gif|svg|webp)$/i,
                  ) ? (
                    <img
                      src={userAchievement.achievement.icon}
                      alt={userAchievement.achievement.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    userAchievement.achievement.icon
                  )}
                </span>
              </div>
              <p className={styles.achievementName}>
                {userAchievement.achievement.name}
              </p>
              <Badge
                count={userAchievement.achievement.rarity}
                style={{
                  backgroundColor: getRarityColor(
                    userAchievement.achievement.rarity,
                  ),
                  fontSize: "0.7rem",
                  textTransform: "capitalize",
                }}
              />
            </div>
          ))}
        </div>
      </Modal>

      {/* All Activities Modal */}
      <Modal
        title={`Lịch sử hoạt động (${stats.recentXP.length})`}
        open={showAllActivities}
        onCancel={() => setShowAllActivities(false)}
        footer={null}
        width={700}
      >
        <div
          className={styles.xpHistory}
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {stats.recentXP.map((transaction) => (
            <div
              key={transaction.transactionId}
              className={styles.xpTransaction}
            >
              <div className={styles.transactionInfo}>
                <span className={styles.transactionDescription}>
                  {removeEmojis(transaction.description)}
                </span>
                <span className={styles.transactionDate}>
                  {new Date(transaction.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <span className={styles.transactionAmount}>
                +{transaction.amount} XP
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default UserStatsCard;
