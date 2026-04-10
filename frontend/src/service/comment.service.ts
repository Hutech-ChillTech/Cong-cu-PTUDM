import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface User {
  userId: string;
  userName: string;
  email: string;
  avatarURL: string | null;
}

export interface Comment {
  commentId: string;
  courseId?: string; // Optional - for course comments
  blogPostId?: string; // Optional - for blog comments
  userId: string;
  content: string;
  rating: number | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

export interface CreateCommentDto {
  courseId: string;
  content: string;
  rating?: number;
}

export interface UpdateCommentDto {
  content?: string;
  rating?: number;
}

export interface CourseRating {
  averageRating: number;
  totalRatings: number;
}

class CommentService {
  // Lấy tất cả comments của khóa học (Public)
  async getCommentsByCourse(courseId: string): Promise<Comment[]> {
    const response = await axios.get(`${API_URL}/comments/course/${courseId}`);
    return response.data.data;
  }

  // Lấy rating trung bình của khóa học (Public)
  async getCourseRating(courseId: string): Promise<CourseRating> {
    const response = await axios.get(
      `${API_URL}/comments/course/${courseId}/rating`
    );
    return response.data.data;
  }

  // Lấy replies của một comment (Public)
  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const response = await axios.get(
      `${API_URL}/comments/${commentId}/replies`
    );
    return response.data.data;
  }

  // Lấy comment theo ID (Public)
  async getCommentById(commentId: string): Promise<Comment> {
    const response = await axios.get(`${API_URL}/comments/${commentId}`);
    return response.data.data;
  }

  // Lấy comments của user hiện tại (Private)
  async getMyComments(): Promise<Comment[]> {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/comments/my-comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }

  // Tạo comment gốc mới (Private)
  async createComment(data: CreateCommentDto): Promise<Comment> {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/comments`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }

  // Tạo reply cho comment (Private)
  async createReply(commentId: string, content: string): Promise<Comment> {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/comments/${commentId}/reply`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  }

  // Cập nhật comment (Private - Owner only)
  async updateComment(
    commentId: string,
    data: UpdateCommentDto
  ): Promise<Comment> {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/comments/${commentId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }

  // Xóa comment (Private - Owner only)
  async deleteComment(commentId: string): Promise<void> {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ============ BLOG POST COMMENTS ============

  // Lấy tất cả comments của blog post (Public)
  async getCommentsByBlogPost(blogPostId: string): Promise<Comment[]> {
    const response = await axios.get(
      `${API_URL}/comments/blog/${blogPostId}`
    );
    return response.data.data;
  }

  // Tạo comment cho blog post (Private)
  async createBlogComment(
    blogPostId: string,
    content: string
  ): Promise<Comment> {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/comments`,
      { blogPostId, content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  }

  // Tạo reply cho blog comment (Private)
  async createBlogReply(
    commentId: string,
    content: string
  ): Promise<Comment> {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/comments/${commentId}/reply`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  }
}

export const commentService = new CommentService();

