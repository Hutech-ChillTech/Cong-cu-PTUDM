import React, { useEffect, useState } from "react";
import { message } from "antd";
import styles from "./XPNotification.module.css";

interface XPNotificationProps {
  xpAwarded: number;
  description?: string;
  leveledUp?: boolean;
  newLevel?: string;
  achievementUnlocked?: {
    name: string;
    icon: string;
    xpReward: number;
  };
}

const XPNotification: React.FC<XPNotificationProps> = ({
  xpAwarded,
  description,
  leveledUp,
  newLevel,
  achievementUnlocked,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto hide sau 5 giây
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show ant design message
    if (xpAwarded > 0) {
      message.success(`+${xpAwarded} XP ${description || ""}`);
    }

    if (leveledUp && newLevel) {
      message.success({
        content: `Chúc mừng! Bạn đã lên ${newLevel}!`,
        duration: 5,
      });
    }

    if (achievementUnlocked) {
      message.success({
        content: `Achievement Unlocked: ${achievementUnlocked.name}! +${achievementUnlocked.xpReward} XP`,
        duration: 5,
      });
    }
  }, [xpAwarded, description, leveledUp, newLevel, achievementUnlocked]);

  if (!visible) return null;

  return (
    <div className={styles.notificationContainer}>
      {xpAwarded > 0 && (
        <div className={styles.xpReward}>
          <span className={styles.xpAmount}>+{xpAwarded} XP</span>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}

      {leveledUp && newLevel && (
        <div className={styles.levelUpNotification}>
          <div className={styles.levelUpContent}>
            <h3 className={styles.levelUpTitle}>Level Up!</h3>
            <p className={styles.levelUpText}>Bạn đã đạt cấp độ {newLevel}!</p>
          </div>
        </div>
      )}

      {achievementUnlocked && (
        <div className={styles.achievementNotification}>
          <span className={styles.achievementIcon}>
            {achievementUnlocked.icon}
          </span>
          <div className={styles.achievementContent}>
            <h3 className={styles.achievementTitle}>
              Achievement Unlocked!
            </h3>
            <p className={styles.achievementName}>{achievementUnlocked.name}</p>
            <span className={styles.achievementXP}>
              +{achievementUnlocked.xpReward} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPNotification;
