import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const ACCESS_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE";

async function testWithAccessToken() {
  console.log("🔍 Checking YouTube API with NEW Access Token...");
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: ACCESS_TOKEN
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      console.log("✅ Access Token works!");
      console.log(`📺 Channel: ${response.data.items[0].snippet?.title}`);
    } else {
      console.log("⚠️ Access Token works but no channel found.");
    }
  } catch (error: any) {
    console.error("❌ Access Token failed!");
    console.error("Message:", error.message);
  }
}

testWithAccessToken();
