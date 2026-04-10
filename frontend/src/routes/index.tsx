import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "../contexts/ToastContext";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// Pages
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/Admin/DashboardPage";
import AdminUser from "../pages/Admin/UserAdmin";
import CourseAdmin from "../pages/Admin/CourseAdmin";
import ChapterList from "../pages/Admin/ChapterList";
import PaymentStatisticsOptimized from "../pages/Admin/PaymentStatisticsOptimized";
import UserMain from "../pages/User/Main";
import PracticePage from "../pages/Lesson/LessonDetailPage";
import NotFountPage from "../pages/Error/NotFoundPage";
import FeaturedCourses from "../pages/User/FeaturedCourses";
import AllCourses from "../pages/User/AllCourses";
import UserProfile from "../pages/User/UserProfile";
import CourseDetailPage from "../pages/User/CourseDetailPage";
import LessonList from "../pages/Admin/LessonList";
import LessonVideoPage from "../pages/User/LessonVideoPage";
import LearningPathMap from "../pages/LearningPathMap/LearningPathMap";
import PaymentPage from "../pages/Payment/PaymentPage";
import PaymentSuccessPage from "../pages/Payment/PaymentSuccessPage";
import PaymentFailedPage from "../pages/Payment/PaymentFailedPage";
import ContactPage from "../pages/User/ContactPage";
import GamificationPage from "../pages/Gamification/GamificationPage";
import XPStatisticsPage from "../pages/Admin/XPStatisticsPage";
import BlogListPage from "../pages/BlogListPage/BlogListPage";
import BlogDetailPage from "../pages/BlogDetailPage/BlogDetailPage";
import SearchPage from "../pages/SearchPage/SearchPage";
import AdminBlogPage from "../pages/Admin/AdminBlogPage";
import AdminTagPage from "../pages/Admin/AdminTagPage";
import AdminCategoryPage from "../pages/Admin/AdminCategoryPage";
import MyCertificates from "../pages/User/MyCertificates";
import CertificateVerify from "../pages/User/CertificateVerify";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<AdminUser />} />
            <Route path="course" element={<CourseAdmin />} />
            <Route path="chapters/:courseId" element={<ChapterList />} />
            <Route path="lessons/:chapterId" element={<LessonList />} />
            <Route
              path="payment-statistics"
              element={<PaymentStatisticsOptimized />}
            />
            <Route path="xp-statistics" element={<XPStatisticsPage />} />
            <Route path="blogs" element={<AdminBlogPage />} />
            <Route path="tags" element={<AdminTagPage />} />
            <Route path="categories" element={<AdminCategoryPage />} />
          </Route>

          {/* User routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<UserMain />} />
            <Route path="practice/:courseId" element={<PracticePage />} />
            <Route
              path="featured-courses"
              element={<FeaturedCourses></FeaturedCourses>}
            ></Route>
            <Route path="all-courses" element={<AllCourses></AllCourses>}></Route>
            <Route path="profile" element={<UserProfile />} />
            <Route path="course/:id" element={<CourseDetailPage />} />
            <Route
              path="course/:courseId/lesson-video/:lessonId"
              element={<LessonVideoPage />}
            />
            <Route path="lesson-video" element={<LessonVideoPage />} />{" "}
            {/* test lesson-video page*/}
            <Route path="learningPathMap" element={<LearningPathMap />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="gamification" element={<GamificationPage />} />
            {/* Blog routes */}
            <Route path="blogs" element={<BlogListPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            {/* Payment routes */}
            <Route path="payment" element={<PaymentPage />} />
            <Route path="payment/success" element={<PaymentSuccessPage />} />
            <Route path="payment/failed" element={<PaymentFailedPage />} />
            <Route path="my-certificates" element={<MyCertificates />} />
          </Route>

          {/* Public routes for certification */}
          <Route
            path="/certificate/verify/:certificateCode"
            element={<CertificateVerify />}
          />

          {/* Payment callback routes - Backup routes ngoài UserLayout */}
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />

          {/* Thông báo lỗi 404 khi người dùng truy cấp vào route không tồn tại */}
          <Route path="*" element={<NotFountPage></NotFountPage>} />
        </Routes>
      </ToastProvider>
    </Router>
  );
};

export default AppRoutes;
