import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface LevelInfo {
  currentLevel: string;
  nextLevel: string | null;
  currentLevelMinXP: number;
  currentLevelMaxXP: number | null;
  nextLevelMinXP: number | null;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
  title: string;
  perks: {
    discount: number;
    badge: string;
    description: string;
  };
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
  requirement: {
    type: string;
    count: number;
  };
  isActive: boolean;
  rarity: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  created_at: string;
  achievement: Achievement;
}

export interface XPTransaction {
  transactionId: string;
  userId: string;
  amount: number;
  source: string;
  description: string;
  courseId?: string;
  lessonId?: string;
  achievementId?: string;
  created_at: string;
}

export interface UserStats {
  userId: string;
  userName: string;
  email: string;
  avatarURL: string | null;
  level: "Basic" | "Intermediate" | "Advanced";
  experiencePoints: number;
  currentLevelXP: number;
  nextLevelXP: number;
  levelProgress: number;
  totalCoursesCompleted: number;
  achievements: {
    total: number;
    unlocked: number;
    list: UserAchievement[];
  };
  recentXP: XPTransaction[];
  levelInfo: LevelInfo;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  userName: string;
  email: string;
  avatarURL: string | null;
  level: string;
  totalXP: number;
}

export interface PublicUserStats {
  userId: string;
  userName: string;
  avatarURL: string | null;
  level: string;
  experiencePoints: number;
  levelProgress: number;
  totalCoursesCompleted: number;
  achievements: {
    total: number;
    unlocked: number;
  };
}

class GamificationService {
  // Lấy stats của user hiện tại
  async getUserStats(): Promise<UserStats> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  }

  // Lấy lịch sử XP
  async getXPHistory(limit: number = 50): Promise<XPTransaction[]> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/history?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  }

  // Lấy bảng xếp hạng
  async getLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
    const { data } = await axios.get(
      `${API_URL}/xp/leaderboard?limit=${limit}`
    );
    return data.data;
  }

  // Lấy tất cả achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data } = await axios.get(`${API_URL}/xp/achievements`);
    return data.data;
  }

  // Lấy achievements của user
  async getMyAchievements(): Promise<UserAchievement[]> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/my-achievements`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  }

  // Lấy public stats của user khác
  async getPublicUserStats(userId: string): Promise<PublicUserStats> {
    const { data } = await axios.get(`${API_URL}/xp/users/${userId}/stats`);
    return data.data;
  }
}

export const gamificationService = new GamificationService();
