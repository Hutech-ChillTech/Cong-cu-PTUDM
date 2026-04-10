import axios from "axios";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadAvatarToCloudinary = async (
  file: File,
  uid: string
): Promise<string> => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `avatars/${uid}`);

    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "_");
    const timestamp = Date.now();
    const finalPublicId = `${cleanFileName}_${timestamp}`;

    formData.append("public_id", finalPublicId);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Lỗi upload Cloudinary:", error);
    throw error;
  }
};
