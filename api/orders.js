// api/orders.js
import { google } from "googleapis";
import nodemailer from "nodemailer"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Read & parse the body
  let payload;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    payload = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Body parse error:", err);
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }
  
  const {
    ordernumber,
    timestamp,
    name,
    email,
    phone,
    address,
    instructions,
    items,
    total,
  } = payload;

  // 2) Authenticate with Google
  let auth;
  try {
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY,  // raw PEM with real newlines
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } catch (err) {
    console.error("❌ Auth init error:", err);
    return res.status(500).json({ success: false, error: "Auth init failed" });
  }

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1EAcw_w9MGCcchIg3l85W0xGcf5ZdkEdlihscp0PSZxM";  // ← replace this!

  // 3) Append the row
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Orders!A:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          ordernumber,
          timestamp,
          name,
          email,
          phone,
          address,
          instructions,
          items,
          total
        ]]
      }
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Sheets append error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailOptions = {
      from: `"PowerPlates" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `🍱 PowerPlates Order Received (#${ordernumber})`,
      text: `
New order #${ordernumber} at ${timestamp}

Customer:
  Name:        ${name}
  Email:       ${email}
  Phone:       ${phone}
  Address:     ${address}

Items:
${items.split("; ").map(line => "  • " + line).join("\n")}

Total: $${total}

Special Instructions:
  ${instructions || "(none)"}
      `.trim()
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("❌ Email send error:", err);
    // We don’t want to block the response if email fails; log and carry on:
  }

  // 4) All done
  return res.status(200).json({ success: true });
}

