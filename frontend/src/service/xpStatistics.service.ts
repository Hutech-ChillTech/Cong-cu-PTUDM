import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface XPOverview {
  totalXP: number;
  totalUsers: number;
  totalAchievements: number;
  avgXP: number;
}

export interface XPPeriodData {
  period: string;
  totalXP: number;
}

export interface TopUserXP {
  rank: number;
  userId: string;
  userName: string;
  email: string;
  avatarURL: string | null;
  level: string;
  totalXP: number;
}

export interface CourseXPStats {
  totalXP: number;
  count: number;
}

export interface InstructorXPStats {
  totalXP: number;
  count: number;
}

export const xpStatisticsService = {
  async getOverviewXP(): Promise<XPOverview> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/statistics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  },

  async getXPByPeriod(params: {
    startDate: string;
    endDate: string;
    groupBy: "day" | "month" | "year";
  }): Promise<XPPeriodData[]> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/statistics/xp-by-period`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  },

  async getTopUsers(limit: number = 10): Promise<TopUserXP[]> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/xp/statistics/top-users`, {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  },

  async getCourseXP(courseId: string): Promise<CourseXPStats> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${API_URL}/xp/statistics/course/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data.data;
  },

  async getInstructorXP(userId: string): Promise<InstructorXPStats> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${API_URL}/xp/statistics/instructor/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data.data;
  },
};
