import Prisma from "../configs/prismaClient";
import { UserRoles, Permissions, RolePermissions } from "../constants/roles";
import { Gender, Level } from "@prisma/client";
import argon2 from "argon2";

const ADMIN_ACCOUNTS = [
  {
    userName: "admin1",
    email: "admin1@hutech.edu.vn",
    password: "Admin@123",
    gender: Gender.MALE,
    region: "Việt Nam",
    level: Level.Advanced,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2000-01-01"),
    avatarURL: "/assest/admin.jpg",
  },
  {
    userName: "admin2",
    email: "admin2@hutech.edu.vn",
    password: "Admin@123",
    gender: Gender.FEMALE,
    region: "Việt Nam",
    level: Level.Advanced,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2000-05-15"),
    avatarURL: "/assest/admin.jpg",
  },
  {
    userName: "admin3",
    email: "admin3@hutech.edu.vn",
    password: "Admin@123",
    gender: Gender.MALE,
    region: "Việt Nam",
    level: Level.Advanced,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2000-10-20"),
    avatarURL: "/assest/admin.jpg",
  },
];

const USER_ACCOUNTS = [
  {
    userName: "user1",
    email: "user1@hutech.edu.vn",
    password: "User@123",
    gender: Gender.MALE,
    region: "Việt Nam",
    level: Level.Basic,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2002-03-15"),
    avatarURL: "/assest/user.png",
  },
  {
    userName: "user2",
    email: "user2@hutech.edu.vn",
    password: "User@123",
    gender: Gender.FEMALE,
    region: "Việt Nam",
    level: Level.Intermediate,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2001-07-20"),
    avatarURL: "/assest/user.png",
  },
  {
    userName: "user3",
    email: "user3@hutech.edu.vn",
    password: "User@123",
    gender: Gender.MALE,
    region: "Korean",
    level: Level.Basic,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2003-11-05"),
    avatarURL: "/assest/user.png",
  },
  {
    userName: "user4",
    email: "user4@hutech.edu.vn",
    password: "User@123",
    gender: Gender.FEMALE,
    region: "Japan",
    level: Level.Intermediate,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2002-09-12"),
    avatarURL: "/assest/user.png",
  },
  {
    userName: "user5",
    email: "user5@hutech.edu.vn",
    password: "User@123",
    gender: Gender.MALE,
    region: "Canada",
    level: Level.Advanced,
    specialization: "Công nghệ thông tin",
    dateOfBirth: new Date("2001-12-25"),
    avatarURL: "/assest/user.png",
  },
];

async function seedRoles() {
  console.log("🌱 Bắt đầu seed roles và permissions...");

  try {
    for (const roleName of Object.values(UserRoles)) {
      const role = await Prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });

      console.log(`✅ Role "${roleName}" đã được tạo/cập nhật`);

      const permissions = RolePermissions[roleName as UserRoles];

      await Prisma.roleClaim.deleteMany({
        where: { roleId: role.roleId },
      });

      for (const permission of permissions) {
        await Prisma.roleClaim.create({
          data: {
            roleId: role.roleId,
            permission: permission,
            claimType: "permission",
            claimValue: permission,
          },
        });
      }
      console.log(
        `   ↳ ${permissions.length} permissions đã được gán cho ${roleName}`
      );
    }

    console.log("\n✅ Hoàn tất seed roles và permissions!");
    console.log("\n📋 Tóm tắt:");
    console.log(
      `   - ADMIN: ${RolePermissions[UserRoles.ADMIN].length} permissions`
    );
    console.log(
      `   - USER: ${RolePermissions[UserRoles.USER].length} permissions`
    );

    console.log("\n👤 Tạo tài khoản ADMIN...");

    const adminRole = await Prisma.role.findUnique({
      where: { name: UserRoles.ADMIN },
    });

    if (!adminRole) {
      throw new Error("Không tìm thấy role ADMIN");
    }

    for (const adminData of ADMIN_ACCOUNTS) {
      const existingUser = await Prisma.user.findUnique({
        where: { email: adminData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️  ${adminData.email} đã tồn tại, bỏ qua...`);
        continue;
      }

      const hashedPassword = await argon2.hash(adminData.password);

      const user = await Prisma.user.create({
        data: {
          userName: adminData.userName,
          email: adminData.email,
          password: hashedPassword,
          gender: adminData.gender,
          region: adminData.region,
          level: adminData.level,
          specialization: adminData.specialization,
          dateOfBirth: adminData.dateOfBirth,
          avatarURL: adminData.avatarURL,
        },
      });

      await Prisma.userRole.create({
        data: {
          userId: user.userId,
          roleId: adminRole.roleId,
        },
      });

      console.log(
        `   ✅ Tạo ADMIN: ${adminData.email} (password: ${adminData.password})`
      );
    }

    console.log("\n👥 Tạo tài khoản USER...");

    const userRole = await Prisma.role.findUnique({
      where: { name: UserRoles.USER },
    });

    if (!userRole) {
      throw new Error("Không tìm thấy role USER");
    }

    for (const userData of USER_ACCOUNTS) {
      const existingUser = await Prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️  ${userData.email} đã tồn tại, bỏ qua...`);
        continue;
      }

      const hashedPassword = await argon2.hash(userData.password);

      const user = await Prisma.user.create({
        data: {
          userName: userData.userName,
          email: userData.email,
          password: hashedPassword,
          gender: userData.gender,
          region: userData.region,
          level: userData.level,
          specialization: userData.specialization,
          dateOfBirth: userData.dateOfBirth,
          avatarURL: userData.avatarURL,
        },
      });

      await Prisma.userRole.create({
        data: {
          userId: user.userId,
          roleId: userRole.roleId,
        },
      });

      console.log(
        `   ✅ Tạo USER: ${userData.email} (password: ${userData.password})`
      );
    }

    console.log("\n🎉 Hoàn tất seed database!");
  } catch (error) {
    console.error("❌ Lỗi khi seed roles:", error);
    throw error;
  } finally {
    await Prisma.$disconnect();
  }
}

seedRoles().catch((error) => {
  console.error(error);
  process.exit(1);
});
