import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function testYouTubeUpload() {
  console.log("🚀 Starting YouTube Upload Test...");
  const filePath = path.join(__dirname, "../../test_video.mp4");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Test file not found at:", filePath);
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const fileSize = fs.statSync(filePath).size;
    console.log(`📦 File size: ${fileSize} bytes`);

    const res = await youtube.videos.insert(
      {
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: "Test Upload " + new Date().toISOString(),
            description: "Testing API connection",
            categoryId: "27",
          },
          status: {
            privacyStatus: "private",
          },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      },
      {
        onUploadProgress: (evt: { bytesRead: number }) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          console.log(`⏳ Progress: ${Math.round(progress)}%`);
        },
      },
    );

    console.log("✅ Upload successful!");
    console.log("🔗 Video ID:", res.data.id);
    console.log("🔗 URL: https://www.youtube.com/watch?v=" + res.data.id);
  } catch (error: any) {
    console.error("❌ Upload failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
  } finally {
    if (fs.existsSync(filePath)) {
      // We might want to keep it for retry or manually delete
      // fs.unlinkSync(filePath);
    }
  }
}

testYouTubeUpload();
