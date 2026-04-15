import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function verifyYouTubeConnection() {
  console.log("🔍 Checking YouTube API Connection...");
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const response = await youtube.channels.list({
      part: ["snippet", "contentDetails", "statistics"],
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log("✅ Connection Successful!");
      console.log(`📺 Channel Name: ${channel.snippet?.title}`);
      console.log(`📝 Description: ${channel.snippet?.description}`);
      console.log(`📊 Statistics:`, channel.statistics);
    } else {
      console.log("⚠️ Connection successful but no channel found for this account.");
    }
  } catch (error: any) {
    console.error("❌ YouTube API Connection Failed!");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

verifyYouTubeConnection();
