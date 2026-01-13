// pages/api/sheets.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // 1. JWT auth using your service account
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    // Now that you pasted raw PEM into Vercel, use it directly:
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  
  // 2. Your sheet ID (from its URL: the long string between /d/ and /edit)
  const spreadsheetId = process.env.SPREADSHEET_ID;

  try {
    // 3a. Read the Menu tab from A to M
    const menuResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Menu!A2:M"  // adjust columns if your Menu sheet has more/fewer
    });
    const menuRows = menuResp.data.values || [];
    const menu = menuRows.map(r => ({
      name:           r[0] ?? "",
      price:          r[1] ?? "",
      category:       r[2] ?? "",
      allowDoubleMeat: String(r[3] ?? "").toUpperCase() === "TRUE",
      imageURL:       r[4] ?? "",
      calories:       r[5] ?? "",
      protein:        r[6] ?? "",
      carbs:          r[7] ?? "",
      fats:           r[8] ?? "",
      extraProtein:   r[9] ?? "",
      display: String(r[10] ?? "").toUpperCase() === "TRUE",
      description: r[11] ?? "",
      moreInfo: r[12] ?? "",
    }));

    // 3b. Read the Config tab
    const cfgResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Config!A2:B"
    });
    const cfgRows = cfgResp.data.values || [];
    const config = Object.fromEntries(cfgRows);

    // 3c. Read the Orders tab (for your order–append logic)
    const ordResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:Z"
    });
    const ordRows = ordResp.data.values || [];
    const orders = ordRows.map(r => ({
      ordernumber: r[0] ?? "",
      timestamp:   r[1] ?? "",
      name:        r[2] ?? "",
      email:       r[3] ?? "",
      phone:       r[4] ?? "",
      address:     r[5] ?? "",
      instructions:r[6] ?? "",
      items:       r[7] ?? "",
      total:       r[8] ?? ""
    }));

    // 4. Return everything in one JSON payload
    res.status(200).json({ menu, config, orders });
  } catch (err) {
    console.error("Sheets API error:", err);
    res.status(500).json({ error: "Failed to fetch sheet data" });
  }
}
