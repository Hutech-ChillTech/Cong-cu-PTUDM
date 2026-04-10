import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const ACCESS_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE";

async function testUploadWithToken() {
  console.log("🚀 Testing Upload with NEW Access Token...");
  const filePath = path.join(__dirname, "../../test_video.mp4");
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "dummy video content");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: ACCESS_TOKEN
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const fileSize = fs.statSync(filePath).size;

    const res = await youtube.videos.insert(
      {
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: "New Token Test " + new Date().getTime(),
            description: "Direct token test",
            categoryId: "27",
          },
          status: {
            privacyStatus: "private",
          },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      }
    );

    console.log("✅ Upload successful using new direct token!");
    console.log("🔗 Video ID:", res.data.id);
  } catch (error: any) {
    console.error("❌ Direct Token Upload failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
  }
}

testUploadWithToken();
