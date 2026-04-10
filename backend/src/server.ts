import app from "./app";
import { autoSeedOnStartup } from "./utils/autoSeed";

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Auto-seed roles, permissions, admin account khi server khởi động
// Đảm bảo dữ liệu cần thiết luôn tồn tại trên mọi môi trường deploy
autoSeedOnStartup()
  .then(() => {
    app.listen(Number(PORT), HOST, () =>
      console.log(
        `🚀 Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
      ),
    );
  })
  .catch((err) => {
    console.error("❌ Auto-seed error:", err);
    // Server vẫn khởi động ngay cả khi seed thất bại
    app.listen(Number(PORT), HOST, () =>
      console.log(
        `🚀 Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode (seed failed)`,
      ),
    );
  });
