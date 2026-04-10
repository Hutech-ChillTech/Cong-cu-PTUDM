# 🎓 Hutech-Edu - E-Learning Platform

Nền tảng học trực tuyến với tính năng quản lý khóa học, bài tập code, quiz và thanh toán trực tuyến.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tính năng](#tính-năng)
- [Cài đặt](#cài-đặt)
- [Các biến môi trường](#các-biến-môi-trường)
- [Scripts](#scripts)
- [Components chính](#components-chính)
- [Services](#services)
- [Hướng dẫn phát triển](#hướng-dẫn-phát-triển)

## 🎯 Tổng quan

Hutech-Edu là một nền tảng e-learning được xây dựng với React, TypeScript và Vite. Hệ thống hỗ trợ:

- Quản lý khóa học, chương, bài học
- Trình biên dịch code trực tuyến (Judge0)
- Quiz trắc nghiệm
- Thanh toán qua MoMo và VNPay
- Quản lý người dùng và phân quyền
- Tracking tiến độ học tập

## 🛠 Công nghệ sử dụng

### Frontend Framework

- **React 19.1.1** - UI Library
- **TypeScript 5.9.3** - Type Safety
- **Vite 7.1.7** - Build Tool & Dev Server

### UI Libraries

- **Ant Design 5.27.4** - Component Library
- **Bootstrap 5.3.8** - CSS Framework
- **Lucide React 0.552.0** - Icons
- **React Icons 5.5.0** - Additional Icons
- **Bootstrap Icons 1.13.1** - Icon Set

### State Management & Routing

- **React Router DOM 7.9.3** - Client-side Routing
- **JWT Decode 4.0.0** - JWT Token Handling

### Code Editor & Player

- **Monaco Editor React 4.7.0** - Code Editor
- **React Player 3.4.0** - Video Player

### Data Visualization

- **Chart.js 4.5.0** - Charts & Graphs

### Backend Integration

- **Axios 1.12.2** - HTTP Client
- **Firebase 12.5.0** - Authentication & Storage

## 📁 Cấu trúc dự án

```
Hutech-Edu-khanhlinh/
│
├── public/                      # Static assets
│   └── images/                  # Image assets
│
├── src/
│   ├── assets/                  # Project assets
│   │
│   ├── components/              # React Components
│   │   ├── Admin/              # Admin components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatCard.tsx
│   │   │
│   │   ├── ChatBox/            # Chat functionality
│   │   │   └── ChatBox.tsx
│   │   │
│   │   ├── CodeRunner/         # Code execution
│   │   │   └── CodeRunner.tsx  # Judge0 integration
│   │   │
│   │   ├── Compiler/           # Code compiler
│   │   │   └── CompilerComponent.tsx
│   │   │
│   │   ├── Lecture/            # Lesson components
│   │   │   ├── LectureDescriptionComponent.tsx
│   │   │   ├── LectureListComponent.tsx
│   │   │   └── LectureListComponent.css
│   │   │
│   │   ├── Payment/            # Payment components
│   │   │   └── PaymentVerification.tsx
│   │   │
│   │   ├── Quiz/               # Quiz system
│   │   │   ├── QuizComponent.tsx
│   │   │   └── QuizComponent.module.css
│   │   │
│   │   ├── User/               # User components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── video/              # Video player
│   │       └── videoLessonComponent.tsx
│   │
│   ├── configs/                # Configuration files
│   │   └── firebaseConfig.ts   # Firebase setup
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   └── useHtmlGrader.ts   # HTML grading hook
│   │
│   ├── layouts/                # Layout components
│   │   ├── AdminLayout.tsx    # Admin layout wrapper
│   │   └── UserLayout.tsx     # User layout wrapper
│   │
│   ├── pages/                  # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   │
│   │   ├── Admin/             # Admin pages
│   │   │   ├── ChapterList.tsx
│   │   │   ├── CourseAdmin.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LessonList.tsx
│   │   │   └── UserAdmin.tsx
│   │   │
│   │   ├── Error/             # Error pages
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── LearningPathMap/   # Learning path
│   │   │   └── LearningPathMap.tsx
│   │   │
│   │   ├── Lesson/            # Lesson pages
│   │   │   └── LessonDetailPage.tsx
│   │   │
│   │   ├── Payment/           # Payment pages
│   │   │   ├── PaymentPage.tsx
│   │   │   ├── PaymentFailedPage.tsx
│   │   │   └── PaymentSuccessPage.tsx
│   │   │
│   │   ├── Practice/          # Practice exercises
│   │   │   └── PracticePage.tsx
│   │   │
│   │   └── User/              # User pages
│   │       └── (various user pages)
│   │
│   ├── routes/                # Route configuration
│   │   └── index.tsx          # Main routing
│   │
│   ├── service/               # API Services
│   │   ├── auth.service.ts           # Authentication
│   │   ├── codeExecution.service.ts  # Code execution
│   │   ├── comment.service.ts        # Comments
│   │   ├── course.service.ts         # Courses
│   │   ├── learningPath.service.ts   # Learning paths
│   │   ├── lesson.service.ts         # Lessons
│   │   ├── payment.service.ts        # Payments
│   │   ├── quiz.service.ts           # Quizzes
│   │   ├── testCase.service.ts       # Test cases
│   │   ├── upload.service.ts         # File uploads
│   │   └── user.service.ts           # User management
│   │
│   ├── styles/                # CSS Modules
│   │   ├── AdminStyle.module.css
│   │   ├── ChatBox.module.css
│   │   ├── ContactPage.module.css
│   │   ├── LearningPathMap.module.css
│   │   ├── LectureList.module.css
│   │   ├── LessonDescription.module.css
│   │   ├── LessonDetailPage.module.css
│   │   ├── LessonVideoPage.module.css
│   │   ├── LoginPage.module.css
│   │   ├── PaymentPage.module.css
│   │   ├── PaymentResult.module.css
│   │   ├── PaymentStatistics.module.css
│   │   ├── PaymentVerification.module.css
│   │   ├── RegisterPage.module.css
│   │   ├── UserCourseDetail.module.css
│   │   ├── UserCoursePage.module.css
│   │   ├── UserFooter.module.css
│   │   ├── UserHeader.module.css
│   │   ├── UserMain.module.css
│   │   └── UserProfile.module.css
│   │
│   ├── types/                 # TypeScript Definitions
│   │   ├── database.types.ts        # Database models
│   │   ├── login.types.ts           # Auth types
│   │   └── reactPlayer.types.ts     # Video player types
│   │
│   ├── utils/                 # Utility functions
│   │   └── cloudinaryHelper.ts      # Cloudinary integration
│   │
│   ├── App.tsx               # Root component
│   ├── App.css               # Global styles
│   ├── main.tsx              # Entry point
│   └── index.css             # Base styles
│
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tsconfig.app.json        # App TS config
├── tsconfig.node.json       # Node TS config
├── vite.config.ts           # Vite configuration
├── PAYMENT_DEBUG_GUIDE.md   # Payment debugging guide
└── README.md                # This file
```

## ✨ Tính năng

### 🎓 Cho Học viên

- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Xem danh sách khóa học
- ✅ Preview khóa học trước khi mua
- ✅ Thanh toán qua MoMo/VNPay
- ✅ Học bài qua video
- ✅ Làm bài tập code với trình biên dịch tích hợp
- ✅ Làm quiz trắc nghiệm
- ✅ Tracking tiến độ học tập
- ✅ Nhận chứng chỉ khi hoàn thành
- ✅ Comment và đánh giá khóa học

### 👨‍💼 Cho Admin/Giảng viên

- ✅ Quản lý khóa học (CRUD)
- ✅ Quản lý chương (CRUD)
- ✅ Quản lý bài học (CRUD)
- ✅ Upload video lên Cloudinary
- ✅ Tạo test case cho bài tập code
- ✅ Tạo quiz trắc nghiệm
- ✅ Quản lý người dùng
- ✅ Xem thống kê doanh thu
- ✅ Xác nhận thanh toán thủ công

### 💻 Code Runner

- ✅ Hỗ trợ nhiều ngôn ngữ lập trình
- ✅ Tích hợp Judge0 API
- ✅ Chạy test case tự động
- ✅ Hiển thị kết quả chi tiết (output, error, time, memory)
- ✅ Chấm điểm tự động

### 💳 Thanh toán

- ✅ MoMo Wallet
- ✅ VNPay (ATM/Visa/MasterCard)
- ✅ Xác thực thanh toán
- ✅ Tự động tạo enrollment sau thanh toán
- ✅ Tracking trạng thái thanh toán

## 📦 Cài đặt

### Yêu cầu

- Node.js >= 18.x
- npm hoặc yarn
- Git

### Các bước cài đặt

1. **Clone repository**

```bash
git clone https://github.com/Hutech-ChillTech/Hutech-Edu.git
cd Hutech-Edu/Hutech-Edu-khanhlinh
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Tạo file .env**

```bash
cp .env.example .env
```

4. **Cấu hình các biến môi trường** (xem phần dưới)

5. **Chạy development server**

```bash
npm run dev
```

6. **Truy cập ứng dụng**

```
http://localhost:5173
```

## 🔐 Các biến môi trường

Tạo file `.env` trong thư mục root với nội dung:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary (optional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
```

## 📜 Scripts

```bash
# Development
npm run dev          # Chạy dev server với hot reload

# Production Build
npm run build        # Build production files

# Preview Production Build
npm run preview      # Preview production build locally

# Linting
npm run lint         # Chạy ESLint để check code
```

## 🧩 Components chính

### CodeRunner

Component để chạy code với Judge0 API, hỗ trợ test cases tự động.

```tsx
import CodeRunner from "@/components/CodeRunner/CodeRunner";

<CodeRunner
  code={sourceCode}
  languageId={LANGUAGE_IDS.JAVASCRIPT}
  testCases={lessonTestCases}
  onResult={(result) => {
    console.log("Test results:", result);
  }}
/>;
```

### QuizComponent

Component hiển thị quiz trắc nghiệm với tính năng chấm điểm tự động.

```tsx
import QuizComponent from "@/components/Quiz/QuizComponent";

<QuizComponent
  chapterId={currentChapter.chapterId}
  lessonName={currentLesson.lessonName}
/>;
```

### PaymentVerification

Component xác thực trạng thái thanh toán và tự động chuyển hướng.

```tsx
import PaymentVerification from "@/components/Payment/PaymentVerification";

<PaymentVerification
  paymentId={paymentId}
  onStatusChange={(status) => {
    console.log("Payment status:", status);
  }}
/>;
```

## 🔌 Services

### Authentication Service

```typescript
import { authService } from "@/service/auth.service";

// Login
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
});

// Register
await authService.register({
  email: "user@example.com",
  userName: "username",
  password: "password123",
});

// Logout
authService.logout();
```

### Code Execution Service

```typescript
import { codeExecutionService } from "@/service/codeExecution.service";

const result = await codeExecutionService.runCode({
  source_code: 'console.log("Hello World");',
  language_id: 63, // JavaScript
  stdin: "",
  expected_output: "Hello World",
});
```

### Payment Service

```typescript
import { paymentService } from "@/service/payment.service";

// Get statistics
const stats = await paymentService.getStatisticsOverview();

// Verify payment
const status = await paymentService.verifyPaymentStatus(paymentId);

// Get all payments (Admin)
const payments = await paymentService.getAllPayments({
  status: "COMPLETED",
  page: 1,
  limit: 10,
});
```

### Course Service

```typescript
import { courseService } from "@/service/course.service";

// Get all courses
const courses = await courseService.getAllCourses();

// Get course by ID
const course = await courseService.getCourseById(courseId);

// Create course (Admin)
await courseService.createCourse(courseData);
```

## 🎨 Styling

Dự án sử dụng CSS Modules cho component-level styling:

```tsx
import styles from "./Component.module.css";

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>;
```

## 🔧 Hướng dẫn phát triển

### Thêm component mới

1. Tạo folder trong `src/components/`
2. Tạo file component `.tsx`
3. Tạo file style `.module.css` (nếu cần)
4. Export component

### Thêm service mới

1. Tạo file trong `src/service/`
2. Định nghĩa interfaces
3. Implement service methods
4. Export service

### Thêm route mới

1. Mở `src/routes/index.tsx`
2. Import page component
3. Thêm route definition
4. Cấu hình permission (nếu cần)

### Type Safety

Tất cả types được định nghĩa trong `src/types/`:

- `database.types.ts` - Database models
- `login.types.ts` - Auth types
- Custom types cho từng feature

## 🐛 Debug

### Payment Debug

Xem file `PAYMENT_DEBUG_GUIDE.md` để biết cách debug payment issues.

### Common Issues

**Build errors:**

```bash
# Clear cache và rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

**Port already in use:**

```bash
# Thay đổi port trong vite.config.ts
server: {
  port: 3001
}
```

## 📝 Database Schema

Xem chi tiết các models trong `src/types/database.types.ts`:

- User
- Course
- Chapter
- Lesson
- TestCase
- Quiz & QuizQuestion
- Payment
- Enrollment
- Certificate
- ...

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Khánh Linh** - Developer
- **Hutech-ChillTech** - Organization

## 📞 Contact

- GitHub: [@Hutech-ChillTech](https://github.com/Hutech-ChillTech)
- Repository: [Hutech-Edu](https://github.com/Hutech-ChillTech/Hutech-Edu)

---

**Made with ❤️ by Hutech-ChillTech Team**
