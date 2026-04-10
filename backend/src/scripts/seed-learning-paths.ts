import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script seed data cho Learning Paths
 *
 * Tạo 3 lộ trình học cố định:
 * 1. Backend Developer Roadmap
 * 2. Frontend Developer Roadmap
 * 3. Full-stack Developer Roadmap
 */

async function main() {
  console.log("🚀 Bắt đầu seed Learning Paths...");

  try {
    // Lấy danh sách courses để link vào paths (sorted by level)
    const allCourses = await prisma.course.findMany({
      select: {
        courseId: true,
        courseName: true,
        specialization: true,
        tag: true,
        level: true,
      },
      orderBy: [{ level: "asc" }, { courseName: "asc" }],
    });

    console.log(`📚 Tìm thấy ${allCourses.length} khóa học trong database`);

    if (allCourses.length === 0) {
      console.log("⚠️  Không có khóa học nào. Vui lòng seed courses trước!");
      return;
    }

    // Phân loại courses theo tag/name
    const htmlCssCourse = allCourses.find((c) =>
      c.courseName.includes("HTML/CSS")
    );
    const jsBasicCourse = allCourses.find(
      (c) => c.courseName === "JavaScript căn bản"
    );
    const jsAdvancedCourse = allCourses.find(
      (c) => c.courseName === "JavaScript nâng cao"
    );
    const reactBasicCourse = allCourses.find(
      (c) => c.courseName === "React cơ bản"
    );
    const reactReduxCourse = allCourses.find(
      (c) => c.courseName === "React + Redux"
    );
    const nextjsCourse = allCourses.find((c) =>
      c.courseName.includes("Next.js")
    );
    const nodeBackendCourse = allCourses.find((c) =>
      c.courseName.includes("Node.js Backend")
    );
    const typescriptCourse = allCourses.find((c) =>
      c.courseName.includes("TypeScript")
    );
    const pythonCourse = allCourses.find((c) =>
      c.courseName.includes("Python")
    );
    const gitCourse = allCourses.find((c) => c.courseName.includes("Git"));
    const microservicesCourse = allCourses.find((c) =>
      c.courseName.includes("Microservices")
    );
    const systemDesignCourse = allCourses.find((c) =>
      c.courseName.includes("System Design")
    );
    const distributedCourse = allCourses.find((c) =>
      c.courseName.includes("Distributed")
    );
    const awsCourse = allCourses.find((c) => c.courseName.includes("AWS"));
    const devopsCourse = allCourses.find((c) =>
      c.courseName.includes("DevOps")
    );

    // Lấy admin user để set createdBy
    const adminUser = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: "Admin",
            },
          },
        },
      },
    });

    // ========================================
    // 1. BACKEND DEVELOPER ROADMAP
    // ========================================
    console.log("\n📍 Tạo Backend Developer Roadmap...");

    const backendPath = await prisma.learningPath.upsert({
      where: { learningPathId: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        learningPathId: "00000000-0000-0000-0000-000000000001",
        title: "Lộ trình Backend Developer",
        description:
          "Lộ trình hoàn chỉnh để trở thành Backend Developer chuyên nghiệp. Từ cơ bản đến nâng cao, bao gồm JavaScript, Node.js, Express, Database, RESTful API, Authentication, Deployment và nhiều hơn nữa.",
        level: "Intermediate",
        estimatedHours: 200,
        isPublished: true,
        createdBy: adminUser?.userId,
      },
    });

    // Các khóa học cho Backend Developer (theo thứ tự học)
    const backendCourseList = [
      gitCourse, // 1. Git và GitHub
      jsBasicCourse, // 2. JavaScript căn bản
      jsAdvancedCourse, // 3. JavaScript nâng cao
      typescriptCourse, // 4. TypeScript Advanced
      nodeBackendCourse, // 5. Node.js Backend
      microservicesCourse, // 6. Microservices Architecture
    ].filter(Boolean); // Loại bỏ undefined courses

    // Thêm courses vào Backend Path
    for (let i = 0; i < backendCourseList.length; i++) {
      const course = backendCourseList[i];
      if (course) {
        await prisma.learningPathCourse.upsert({
          where: {
            learningPathId_courseId: {
              learningPathId: backendPath.learningPathId,
              courseId: course.courseId,
            },
          },
          update: {},
          create: {
            learningPathId: backendPath.learningPathId,
            courseId: course.courseId,
            orderIndex: i + 1,
            isRequired: i < 5, // 5 khóa đầu là bắt buộc
          },
        });
      }
    }

    console.log(
      `✅ Đã tạo Backend Path với ${backendCourseList.length} khóa học`
    );

    // ========================================
    // 2. FRONTEND DEVELOPER ROADMAP
    // ========================================
    console.log("\n📍 Tạo Frontend Developer Roadmap...");

    const frontendPath = await prisma.learningPath.upsert({
      where: { learningPathId: "00000000-0000-0000-0000-000000000002" },
      update: {},
      create: {
        learningPathId: "00000000-0000-0000-0000-000000000002",
        title: "Lộ trình Frontend Developer",
        description:
          "Lộ trình đầy đủ để trở thành Frontend Developer. Học HTML, CSS, JavaScript, React/Vue/Angular, Responsive Design, State Management, Testing và Deploy ứng dụng web hiện đại.",
        level: "Intermediate",
        estimatedHours: 180,
        isPublished: true,
        createdBy: adminUser?.userId,
      },
    });

    // Các khóa học cho Frontend Developer (theo thứ tự học)
    const frontendCourseList = [
      htmlCssCourse, // 1. HTML/CSS cơ bản
      jsBasicCourse, // 2. JavaScript căn bản
      jsAdvancedCourse, // 3. JavaScript nâng cao
      reactBasicCourse, // 4. React cơ bản
      reactReduxCourse, // 5. React + Redux
      nextjsCourse, // 6. Next.js Full-stack
    ].filter(Boolean);

    // Thêm courses vào Frontend Path
    for (let i = 0; i < frontendCourseList.length; i++) {
      const course = frontendCourseList[i];
      if (course) {
        await prisma.learningPathCourse.upsert({
          where: {
            learningPathId_courseId: {
              learningPathId: frontendPath.learningPathId,
              courseId: course.courseId,
            },
          },
          update: {},
          create: {
            learningPathId: frontendPath.learningPathId,
            courseId: course.courseId,
            orderIndex: i + 1,
            isRequired: i < 5,
          },
        });
      }
    }

    console.log(
      `✅ Đã tạo Frontend Path với ${frontendCourseList.length} khóa học`
    );

    // ========================================
    // 3. FULL-STACK DEVELOPER ROADMAP
    // ========================================
    console.log("\n📍 Tạo Full-stack Developer Roadmap...");

    const fullstackPath = await prisma.learningPath.upsert({
      where: { learningPathId: "00000000-0000-0000-0000-000000000003" },
      update: {},
      create: {
        learningPathId: "00000000-0000-0000-0000-000000000003",
        title: "Lộ trình Full-stack Developer",
        description:
          "Lộ trình toàn diện để trở thành Full-stack Developer. Kết hợp Frontend và Backend, học React, Node.js, Express, Database, Authentication, Deployment, Docker, CI/CD và các kỹ thuật phát triển hiện đại.",
        level: "Advanced",
        estimatedHours: 300,
        isPublished: true,
        createdBy: adminUser?.userId,
      },
    });

    // Các khóa học cho Fullstack Developer (Frontend + Backend)
    const fullstackCourseList = [
      htmlCssCourse, // 1. HTML/CSS cơ bản
      jsBasicCourse, // 2. JavaScript căn bản
      jsAdvancedCourse, // 3. JavaScript nâng cao
      gitCourse, // 4. Git và GitHub
      reactBasicCourse, // 5. React cơ bản
      nodeBackendCourse, // 6. Node.js Backend
      reactReduxCourse, // 7. React + Redux
      typescriptCourse, // 8. TypeScript Advanced
      nextjsCourse, // 9. Next.js Full-stack
      microservicesCourse, // 10. Microservices Architecture
    ].filter(Boolean);

    // Thêm courses vào Fullstack Path
    for (let i = 0; i < fullstackCourseList.length; i++) {
      const course = fullstackCourseList[i];
      if (course) {
        await prisma.learningPathCourse.upsert({
          where: {
            learningPathId_courseId: {
              learningPathId: fullstackPath.learningPathId,
              courseId: course.courseId,
            },
          },
          update: {},
          create: {
            learningPathId: fullstackPath.learningPathId,
            courseId: course.courseId,
            orderIndex: i + 1,
            isRequired: i < 8, // 8 khóa đầu là bắt buộc
          },
        });
      }
    }

    console.log(
      `✅ Đã tạo Full-stack Path với ${fullstackCourseList.length} khóa học`
    );

    // ========================================
    // 4. MOBILE APP DEVELOPER ROADMAP (BONUS)
    // ========================================
    console.log("\n📍 Tạo Mobile App Developer Roadmap...");

    const mobilePath = await prisma.learningPath.upsert({
      where: { learningPathId: "00000000-0000-0000-0000-000000000004" },
      update: {},
      create: {
        learningPathId: "00000000-0000-0000-0000-000000000004",
        title: "Lộ trình Mobile App Developer",
        description:
          "Lộ trình để trở thành Mobile App Developer. Học React Native, Flutter, hoặc Native iOS/Android. Xây dựng ứng dụng di động đa nền tảng với UI/UX đẹp và performance tối ưu.",
        level: "Intermediate",
        estimatedHours: 150,
        isPublished: true,
        createdBy: adminUser?.userId,
      },
    });

    // Các khóa học cho Mobile App Developer (React Native foundation)
    const mobileCourseList = [
      jsBasicCourse, // 1. JavaScript căn bản
      jsAdvancedCourse, // 2. JavaScript nâng cao
      reactBasicCourse, // 3. React cơ bản
      reactReduxCourse, // 4. React + Redux
      gitCourse, // 5. Git và GitHub
    ].filter(Boolean);

    // Thêm courses vào Mobile Path
    for (let i = 0; i < mobileCourseList.length; i++) {
      const course = mobileCourseList[i];
      if (course) {
        await prisma.learningPathCourse.upsert({
          where: {
            learningPathId_courseId: {
              learningPathId: mobilePath.learningPathId,
              courseId: course.courseId,
            },
          },
          update: {},
          create: {
            learningPathId: mobilePath.learningPathId,
            courseId: course.courseId,
            orderIndex: i + 1,
            isRequired: i < 4,
          },
        });
      }
    }

    console.log(
      `✅ Đã tạo Mobile Path với ${mobileCourseList.length} khóa học`
    );

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n✨ Hoàn thành seed Learning Paths!");
    console.log("==========================================");
    console.log("📊 Tóm tắt:");
    console.log(`  ✅ Backend Developer Roadmap`);
    console.log(`  ✅ Frontend Developer Roadmap`);
    console.log(`  ✅ Full-stack Developer Roadmap`);
    console.log(`  ✅ Mobile App Developer Roadmap`);
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Lỗi khi seed Learning Paths:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
