import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

// Cấu hình lưu tạm video lên ổ cứng để tránh tràn RAM khi chơi video lớn (vài GB)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../tmp/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB cho ảnh đẹp
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được upload file ảnh!"));
    }
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 5000 * 1024 * 1024 }, // Hỗ trợ tối đa 5GB cho video 1-2 tiếng
  fileFilter: (req, file, cb) => {
    console.log("--- Multer File Filter ---");
    console.log("Original Name:", file.originalname);
    console.log("Mimetype:", file.mimetype);

    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/octet-stream" ||
      file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
    ) {
      cb(null, true);
    } else {
      console.warn("Rejecting file:", file.originalname, file.mimetype);
      cb(new Error("Chỉ được upload file video (mp4, mov, avi, etc.)!"));
    }
  },
});
