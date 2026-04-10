import { Express } from "express";
import userRoute from "./user.route";
import chapterRoute from "./chapter.route";
import courseRoute from "./course.route";
import lessonRoute from "./lesson.route";
import enrollmentRoute from "./enrollment.route";
import quizRoute from "./quiz.route";
import submissionRoute from "./submission.route";
import certificateRoute from "./certificate.route";
import learningSpeedRoute from "./learningSpeed.route";
import paymentRoute from "./payment.route";
import learningPathRoute from "./learningPath.route";
import testCaseRoute from "./testCase.route";
import testCodeRoute from "./testCode.route";
import codeSubmissionRoute from "./codeSubmission.route";
import uploadRoute from "./upload.route";
import commentRoute from "./comment.route";
import progressRoute from "./progress.route";
import xpRoute from "./xp.route";
import learningSessionRoute from "./learningSession.route";
import courseTrackingRoute from "./courseTracking.route";
import tagRoute from "./tag.route";
import searchRoute from "./search.route";
import categoryRoute from "./category.route";
import blogRoute from "./blog.route";
import courseRecommendationRoute from "./courseRecommendation.route";

function setUpRoutes(app: Express) {
  app.use("/api/users", userRoute);
  app.use("/api/courses", courseRoute);
  app.use("/api/chapters", chapterRoute);
  app.use("/api/lessons", lessonRoute);
  app.use("/api/enrollments", enrollmentRoute);
  app.use("/api/quizzes", quizRoute);
  app.use("/api/submissions", submissionRoute);
  app.use("/api/certificates", certificateRoute);
  app.use("/api/learning-speed", learningSpeedRoute);
  app.use("/api/payment", paymentRoute);
  app.use("/api/learning-paths", learningPathRoute);
  app.use("/api/test-cases", testCaseRoute);
  app.use("/api/test-code", testCodeRoute);
  app.use("/api/code-submissions", codeSubmissionRoute);
  app.use("/api/media", uploadRoute);
  app.use("/api/uploads", uploadRoute); // Alias for consistency
  app.use("/api/comments", commentRoute);
  app.use("/api/progress", progressRoute);
  app.use("/api/xp", xpRoute); // ⭐ XP & Gamification routes
  app.use("/api/sessions", learningSessionRoute); // ⏱️ Learning Session Tracking
  app.use("/api/courses", courseTrackingRoute); // 📊 Course Completion Time Tracking
  app.use("/api/tags", tagRoute); // 🏷️ Tag Management
  app.use("/api/categories", categoryRoute); // 📂 Category Management
  app.use("/api/search", searchRoute); // 🔍 Advanced Search (Courses by Tags)
  app.use("/api/blog-posts", blogRoute); // 📝 Blog Posts
  app.use("/api/recommendations", courseRecommendationRoute); // 🎯 Course Recommendations
}

export default setUpRoutes;
