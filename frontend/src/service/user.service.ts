import { type User } from "../types/database.types";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy tất cả người dùng.");
      }
      return data.data || (data as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  getUserByUid: async (uid: string): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/users/uid/${uid}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy người dùng theo ID.");
      }
      return data.data || (data as User);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },
  updateUser: async (uid: string, userData: Partial<User>): Promise<User> => {
    try {
      console.log("UID: ", uid);
      const res = await fetch(`${API_URL}/users/${uid}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể cập nhật người dùng.");
      }
      return data.data || (data as User);
    } catch (error) {
      console.error("Error updating user: ", error);
      throw error;
    }
  },
  deleteUser: async (uid: string): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/users/${uid}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Không thể xóa người dùng.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
