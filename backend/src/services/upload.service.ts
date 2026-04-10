import cloudinary from "../configs/cloudinary";
import { getBucket } from "../configs/firebaseAdminConfig";
import { Readable } from "stream";

const ALLOWED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
];

export const uploadVideoToCloudinary = async (
  chapterId: string,
  fileBuffer: Buffer,
  folder: string = "course-videos"
) => {
  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const folderPath = `chapters/${chapterId}/videos`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: folderPath,
        chunk_size: 6000000, // 6MB
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

export const uploadImageToFirebase = async (
  userId: string,
  file: Express.Multer.File,
  folder: string = "avatars"
) => {
  return new Promise<string>((resolve, reject) => {
    if (!file) {
      return reject(new Error("Không tìm thấy file để upload."));
    }

    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      return reject(
        new Error(
          "Định dạng file không hợp lệ. Chỉ chấp nhận ảnh (JPEG, PNG, GIF, WEBP)."
        )
      );
    }

    const folderPath = `users/${userId}/avatars}`;

    const fileName = `${folderPath}/${Date.now()}-${file.originalname.replace(
      /\s+/g,
      "-"
    )}`;

    const bucket = getBucket();
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error: Error) => reject(error));

    blobStream.on("finish", async () => {
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
