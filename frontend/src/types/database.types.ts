// --- ENUMS ---

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type Level = "Basic" | "Intermediate" | "Advanced";

// Helper type cho JSON (được dùng trong CodeSubmission)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// --- MODELS ---

export interface User {
  userId: string;
  userName: string;
  fullName?: string;
  password?: string; // Nên để optional vì thường không trả về FE
  firebaseUid?: string;
  email: string;
  gender: Gender;
  avatarURL: string | null;
  region: string | null;
  dateOfBirth: Date | string | null;
  level: Level | null;
  specialization?: string;
  created_at: Date | string;
  updated_at: Date | string;

  // Relations (Optional vì tùy vào việc bạn có include hay không)
  account?: Account | null;
  roles?: UserRole[];
  coursesCreated?: Course[];
  comments?: Comment[];
  payments?: Payment[];
  certificates?: Certificate[];
  notifications?: Notification[];
  userCoursePreviews?: UserCoursePreview[];
  submissions?: Submission[];
  codeSubmissions?: CodeSubmission[];
  lessonsProgress?: UserLessonProgress[];
  enrollments?: Enrollment[];
}

export interface CodeSubmission {
  submissionId: string;
  userId: string;
  testCaseId: string;
  source_code: string | null;
  language_id: number | null;
  stdin: string | null;
  expected_output: string | null;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  token: string | null;
  memory: number | null;
  status: Json | null; // Kiểu JSON
  message: string | null;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
  testCase?: TestCase;
}

export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
}

export interface Role {
  roleId: string;
  name: string;

  userRoles?: UserRole[];
  roleClaims?: RoleClaim[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;

  user?: User;
  role?: Role;
}

export interface RoleClaim {
  roleClaimId: string;
  roleId: string | null;
  permission: string;
  claimType: string | null;
  claimValue: string | null;

  role?: Role | null;
}

export interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string | null;
  coursePrice: number;
  discount: number | null;
  avatarURL: string | null;
  level: Level | null;
  createdBy: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  isEnrolled?: boolean; // Backend tự động thêm field này khi user đã login

  user?: User | null;
  chapters?: Chapter[];
  comments?: Comment[];
  enrollments?: Enrollment[];
  certificates?: Certificate[];
  userCoursePreviews?: UserCoursePreview[];
}

export interface Chapter {
  chapterId: string;
  chapterName: string;
  totalLesson: number;
  courseId: string;
  created_at: Date | string;
  updated_at: Date | string;

  course?: Course;
  lessons?: Lesson[];
  chapterQuizzes?: ChapterQuiz[];
}

export interface Lesson {
  lessonId: string;
  lessonName: string;
  videoUrl: string | null;
  content: string | null;
  isPreview: boolean;
  publicIdVideo: string | null;
  chapterId: string;
  created_at: Date | string;
  updated_at: Date | string;

  chapter?: Chapter;
  submissions?: Submission[];
  testCases?: TestCase[];
  lessonsProgress?: UserLessonProgress[];
}

export interface TestCase {
  testCaseId: string;
  description: string | null;
  input: string | null;
  expectedOutput: string | null;
  lessonId: string;

  testCodes?: string;
  created_at: Date | string;
  updated_at: Date | string;

  lesson?: Lesson;
  codeSubmissions?: CodeSubmission[];
}

export interface Comment {
  commentId: string;
  courseId: string;
  userId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  user?: User;
  course?: Course;
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: string | null;
  title: string | null;
  message: string | null;
  isRead: boolean;
  link: string | null;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
}

export interface Payment {
  paymentId: string;
  description: string | null;
  currency: string | null;
  amount: number;
  method: string | null;
  paidAt: Date | string | null;
  userId: string | null;
  userCoursePreviewId: string | null;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User | null;
  userCoursePreview?: UserCoursePreview | null;
}

export interface UserCoursePreview {
  userCoursePreviewId: string;
  userId: string;
  courseId: string;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
  course?: Course;
  payments?: Payment[];
}

/**
 * Certificate Interface
 *
 * ⚠️ QUAN TRỌNG - Phân biệt 2 field:
 * - certificateId: UUID duy nhất của certificate (dùng để gọi API /api/certificates/:certificateId)
 * - certificateURL: Đường dẫn file PDF (dùng để hiển thị/download PDF)
 *
 * ❌ SAI: fetch(`/api/certificates/${certificate.certificateURL}`)
 * ✅ ĐÚNG: fetch(`/api/certificates/${certificate.certificateId}`)
 * ✅ ĐÚNG: window.open(certificate.certificateURL) // để mở PDF
 */
export interface Certificate {
  certificateId: string; // UUID - dùng để gọi API
  submissionId: string | null;
  certificateTitle: string | null;
  userId: string;
  courseId: string;
  certificateURL: string | null; // Path to PDF file - dùng để hiển thị/download
  pdfUrl?: string; // Cloudinary PDF URL
  viewUrl?: string; // Cloudinary view URL
  issuedAt: Date | string;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
  course?: Course;
  submission?: Submission | null;
}

export interface Submission {
  submissionId: string;
  score: number | null;
  isPassed: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  userId: string;
  chapterQuizId: string | null;
  lessonId: string | null;

  user?: User;
  chapterQuiz?: ChapterQuiz | null;
  lesson?: Lesson | null;
  certificates?: Certificate[];
}

export interface ChapterQuiz {
  chapterQuizId: string;
  title: string;
  description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  chapterId: string | null;

  chapter?: Chapter | null;
  quizQuestions?: QuizQuestion[];
  submissions?: Submission[];
}

export interface QuizQuestion {
  quizQuestionId: string;
  questionText: string;
  questionType: string;
  created_at: Date | string;
  updated_at: Date | string;
  chapterQuizId: string | null;

  chapterQuiz?: ChapterQuiz | null;
  quizOptions?: QuizOption[];
}

export interface QuizOption {
  quizOptionId: string;
  optionText: string;
  isCorrect: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  quizQuestionId: string;

  quizQuestion?: QuizQuestion;
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  lastAccessAt: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;

  user?: User;
  lesson?: Lesson;
}

export interface Enrollment {
  enrollmentId: string;
  createdAt: Date | string;
  userId: string;
  courseId: string;

  user?: User;
  course?: Course;
}
