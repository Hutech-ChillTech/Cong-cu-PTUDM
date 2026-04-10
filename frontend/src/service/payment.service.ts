const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Types
export interface PaymentStatisticsOverview {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  revenueByMethod: Array<{
    method: string;
    revenue: number;
    count: number;
  }>;
  monthlyRevenue: {
    revenue: number;
    count: number;
  };
  dailyRevenue: {
    revenue: number;
    count: number;
  };
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  count: number;
  methods: {
    MOMO?: number;
    VNPAY?: number;
  };
}

export interface TopCourse {
  courseId: string;
  courseName: string;
  avatarURL: string;
  instructor: string;
  totalRevenue: number;
  totalSales: number;
}

export interface UserPaymentStats {
  userId: string;
  userName: string;
  email: string;
  avatarURL?: string;
  totalSpent: number;
  transactionCount: number;
}

export interface CourseRevenue {
  courseId: string;
  totalRevenue: number;
  totalSales: number;
  paymentMethods: Array<{
    method: string;
    revenue: number;
    count: number;
  }>;
}

export interface InstructorRevenue {
  instructorId: string;
  totalRevenue: number;
  totalSales: number;
  courseCount: number;
  topCourses: Array<{
    courseId: string;
    revenue: number;
    sales: number;
  }>;
}

export interface Payment {
  paymentId: string;
  userId: string;
  courseId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderId: string;
  transactionId: string;
  created_at: string;
  paidAt: string;
  user: {
    userId: string;
    userName: string;
    email: string;
  };
  course: {
    courseId: string;
    courseName: string;
  };
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaymentVerification {
  paymentId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderInfo?: string;
  paidAt: string | null;
  created_at: string;
  course: {
    courseId: string;
    courseName: string;
  };
  enrollment: {
    enrollmentId: string;
    enrolledAt: string;
  } | null;
}

export const paymentService = {
  // 1. Thống kê tổng quan
  getStatisticsOverview: async (): Promise<PaymentStatisticsOverview> => {
    try {
      const res = await fetch(`${API_URL}/payment/statistics/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy thống kê tổng quan.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching statistics overview:", error);
      throw error;
    }
  },

  // 2. Thống kê doanh thu theo thời gian
  getRevenueByPeriod: async (
    startDate: string,
    endDate: string,
    groupBy: "day" | "month" | "year" = "day",
  ): Promise<RevenueByPeriod[]> => {
    try {
      const res = await fetch(
        `${API_URL}/payment/statistics/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy thống kê doanh thu.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching revenue by period:", error);
      throw error;
    }
  },

  // 3. Top khóa học bán chạy
  getTopSellingCourses: async (limit: number = 10): Promise<TopCourse[]> => {
    try {
      const res = await fetch(
        `${API_URL}/payment/statistics/top-courses?limit=${limit}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy top khóa học.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching top courses:", error);
      throw error;
    }
  },

  // 4. Thống kê doanh thu theo khóa học
  getRevenueByCourse: async (courseId: string): Promise<CourseRevenue> => {
    try {
      const res = await fetch(
        `${API_URL}/payment/statistics/course/${courseId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy thống kê khóa học.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching course revenue:", error);
      throw error;
    }
  },

  // 5. Thống kê doanh thu theo giảng viên
  getRevenueByInstructor: async (
    userId: string,
  ): Promise<InstructorRevenue> => {
    try {
      const res = await fetch(
        `${API_URL}/payment/statistics/instructor/${userId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy thống kê giảng viên.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching instructor revenue:", error);
      throw error;
    }
  },

  // 6. Danh sách tất cả giao dịch (Admin)
  getAllPayments: async (options?: {
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaymentListResponse> => {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.method) params.append("method", options.method);
      if (options?.startDate) params.append("startDate", options.startDate);
      if (options?.endDate) params.append("endDate", options.endDate);
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const res = await fetch(
        `${API_URL}/payment/admin/all?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy danh sách giao dịch.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  },

  // 7. Admin xác nhận thanh toán thủ công (ADMIN only)
  confirmPayment: async (
    paymentId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_URL}/payment/admin/confirm/${paymentId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể xác nhận thanh toán.");
      }
      return data.data;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },

  // 8. Admin từ chối thanh toán (ADMIN only)
  rejectPayment: async (
    paymentId: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_URL}/payment/admin/reject/${paymentId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể từ chối thanh toán.");
      }
      return data.data;
    } catch (error) {
      console.error("Error rejecting payment:", error);
      throw error;
    }
  },

  // 9. User kiểm tra trạng thái thanh toán
  verifyPaymentStatus: async (
    paymentId: string,
  ): Promise<PaymentVerification> => {
    try {
      const res = await fetch(`${API_URL}/payment/verify/${paymentId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (res.status === 403) {
        throw new Error("Forbidden");
      }
      if (!res.ok) {
        throw new Error(
          data?.error || "Không thể kiểm tra trạng thái thanh toán.",
        );
      }
      return data.data;
    } catch (error) {
      console.error("Error verifying payment status:", error);
      throw error;
    }
  },

  // 10. Thống kê top học viên chi tiêu cao (ADMIN only)
  getTopSpenders: async (limit: number = 10): Promise<UserPaymentStats[]> => {
    try {
      const res = await fetch(
        `${API_URL}/payment/statistics/top-spenders?limit=${limit}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Không thể lấy thống kê học viên.");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching top spenders:", error);
      throw error;
    }
  },
};
