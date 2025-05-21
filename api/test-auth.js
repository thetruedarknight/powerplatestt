// pages/api/test-auth.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // Build the JWT client
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Try to grab an access token
    const tokens = await auth.authorize();
    console.log("✔️ Auth succeeded, tokens:", tokens);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Auth failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
