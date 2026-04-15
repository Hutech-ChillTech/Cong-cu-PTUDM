import PrismaClient from "../configs/prismaClient";
import { UserRoles, RolePermissions } from "../constants/roles";
import { Gender, Level } from "@prisma/client";
import argon2 from "argon2";

/**
 * Auto-seed roles, permissions và admin accounts khi server khởi động.
 * Hàm này được gọi trong server.ts để đảm bảo dữ liệu cần thiết luôn tồn tại.
 *
 * Tại sao cần auto-seed?
 * - Trên môi trường deploy (Render, Railway...), seed script có thể không được chạy
 *   nếu start command chỉ là `node dist/server.js` thay vì `npm start`
 * - Đảm bảo roles luôn tồn tại cho Google Login và đăng ký user mới
 * - Idempotent: chạy nhiều lần không gây lỗi hoặc duplicate data
 */
export async function autoSeedOnStartup(): Promise<void> {
  try {
    console.log("🔍 Kiểm tra dữ liệu seed...");

    // 1. Seed Roles
    for (const roleName of Object.values(UserRoles)) {
      await PrismaClient.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
    }
    console.log("✅ Roles đã sẵn sàng (Admin, User)");

    // 2. Seed Role Permissions
    for (const roleName of Object.values(UserRoles)) {
      const role = await PrismaClient.role.findUnique({
        where: { name: roleName },
      });

      if (!role) continue;

      const permissions = RolePermissions[roleName as UserRoles];

      for (const permission of permissions) {
        const existing = await PrismaClient.roleClaim.findFirst({
          where: {
            roleId: role.roleId,
            permission: permission,
          },
        });

        if (!existing) {
          await PrismaClient.roleClaim.create({
            data: {
              roleId: role.roleId,
              permission: permission,
              claimType: "permission",
              claimValue: permission,
            },
          });
        }
      }
    }
    console.log("✅ Permissions đã sẵn sàng");

    // 3. Seed Admin Account (ít nhất 1 admin)
    const adminRole = await PrismaClient.role.findUnique({
      where: { name: UserRoles.ADMIN },
    });

    if (!adminRole) {
      console.warn("⚠️  Không tìm thấy role Admin, bỏ qua seed admin");
      return;
    }

    const adminEmail = "admin1@hutech.edu.vn";
    const existingAdmin = await PrismaClient.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await argon2.hash("Admin@123");

      const admin = await PrismaClient.user.create({
        data: {
          userName: "admin1",
          email: adminEmail,
          password: hashedPassword,
          gender: Gender.MALE,
          region: "Việt Nam",
          level: Level.Advanced,
          specialization: "Công nghệ thông tin",
          dateOfBirth: new Date("2000-01-01"),
          avatarURL: "/assest/admin.jpg",
        },
      });

      await PrismaClient.userRole.create({
        data: {
          userId: admin.userId,
          roleId: adminRole.roleId,
        },
      });

      console.log(`✅ Tạo tài khoản Admin: ${adminEmail} / Admin@123`);
    } else {
      // Kiểm tra admin đã có role Admin chưa
      const hasAdminRole = await PrismaClient.userRole.findFirst({
        where: {
          userId: existingAdmin.userId,
          roleId: adminRole.roleId,
        },
      });

      if (!hasAdminRole) {
        await PrismaClient.userRole.create({
          data: {
            userId: existingAdmin.userId,
            roleId: adminRole.roleId,
          },
        });
        console.log(`✅ Gán role Admin cho ${adminEmail}`);
      } else {
        console.log(`✅ Admin ${adminEmail} đã tồn tại`);
      }
    }

    console.log("🎉 Auto-seed hoàn tất!");
  } catch (error) {
    // Không throw error để server vẫn khởi động được
    // Nếu seed fail (vd: DB chưa migrate), server vẫn chạy
    console.error("⚠️  Auto-seed thất bại (server vẫn tiếp tục):", error);
  }
}
