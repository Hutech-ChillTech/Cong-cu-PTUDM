const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface Certificate {
  certificateId: string;
  userId: string;
  courseId: string;
  certificateCode?: string; // Mã chứng chỉ (new format)
  certificateTitle: string;
  pdfUrl?: string; // URL PDF từ Cloudinary (new format)
  viewUrl?: string; // Backend-generated view URL (normalized)
  certificateURL?: string; // Legacy format (fallback)
  qrCodeUrl?: string; // QR code URL (optional)
  totalScore: number;
  averageScore: number;
  maxScore: number;
  issuedAt: string;
  user?: {
    userName: string;
    email: string;
  };
  course?: {
    courseName: string;
    level: string;
  };
}

export const certificateService = {
  // Lấy certificate của user trong 1 course
  // ⚠️ LƯU Ý: API trả về certificate object chứa:
  // - certificateId (UUID): ID duy nhất của certificate
  // - certificateURL (string): Đường dẫn file PDF (có thể null nếu chưa generate)
  // - userId, courseId, averageScore, issueDate, etc.
  getUserCertificateInCourse: async (
    courseId: string,
  ): Promise<Certificate | null> => {
    try {
      const res = await fetch(`${API_URL}/certificates/course/${courseId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        const data = await res.json();
        throw new Error(data?.message || "Không thể lấy certificate");
      }

      const result = await res.json();
      return result.data || null;
    } catch (error) {
      console.error("Error fetching certificate:", error);
      return null;
    }
  },

  // Tạo certificate mới cho course
  issueCertificate: async (courseId: string): Promise<Certificate | null> => {
    try {
      const res = await fetch(`${API_URL}/certificates/issue/${courseId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Không thể tạo certificate");
      }

      const result = await res.json();
      return result.data?.certificate || result.data || null;
    } catch (error) {
      console.error("Error issuing certificate:", error);
      throw error;
    }
  },

  // Lấy tất cả certificates của user
  getUserCertificates: async (): Promise<Certificate[]> => {
    try {
      const res = await fetch(`${API_URL}/certificates/my-certificates`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy certificates");
      }

      return data.data || data || [];
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return [];
    }
  },

  // Lấy certificate theo ID (cho verification)
  getCertificateById: async (
    certificateId: string,
  ): Promise<Certificate | null> => {
    try {
      const res = await fetch(`${API_URL}/certificates/${certificateId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy certificate");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error fetching certificate:", error);
      return null;
    }
  },

  // Tạo certificate thủ công (admin)
  adminIssueCertificate: async (userId: string, courseId: string) => {
    try {
      const res = await fetch(`${API_URL}/certificates/issue`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, courseId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Không thể tạo certificate");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error issuing certificate:", error);
      throw error;
    }
  },
};
