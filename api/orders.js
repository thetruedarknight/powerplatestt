// api/orders.js
import { google } from "googleapis";
import nodemailer from "nodemailer";

const ORDER_OFFSET = 1098; // so that row 2 → order 1100

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Parse JSON body
  let payload;
  try {
    const buf = [];
    for await (const chunk of req) buf.push(chunk);
    payload = JSON.parse(Buffer.concat(buf).toString("utf8"));
  } catch (err) {
    console.error("❌ Body parse error:", err);
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }

  const {
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
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } catch (err) {
    console.error("❌ Auth init error:", err);
    return res.status(500).json({ success: false, error: "Auth init failed" });
  }

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  let rowIndex;
  try {
    // 3) Append row with blank OrderNumber in col A
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Orders!A2:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          "",          // OrderNumber to fill in later
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

    // 4) Extract the row index from updatedRange (e.g. "Orders!A5:I5" → rowIndex = 5)
    const updatedRange = appendRes.data.updates.updatedRange; 
    // split "Orders!A5:I5" → ["Orders","A5:I5"], take "A5", strip non-digits → "5"
    rowIndex = parseInt(
      updatedRange.split("!")[1].split(":")[0].replace(/\D/g, ""),
      10
    );
  } catch (err) {
    console.error("❌ Sheets append error:", err);
    return res.status(500).json({ success: false, error: "Sheet append failed" });
  }

  // 5) Compute and write back the OrderNumber
  const newOrderNumber = rowIndex + ORDER_OFFSET;
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Orders!A${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[newOrderNumber]] }
    });
  } catch (err) {
    console.error("❌ Writing order number error:", err);
    // not fatal to the user—proceed to email but log for debugging
  }

  // 6) Send notification email via Gmail
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.verify();
    console.log("✅ SMTP verified");

    const mailOptions = {
      from: `"PowerPlates" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      cc: process.env.RECIPIENT_EMAIL,
      subject: `🍱 PowerPlates Order Received (#${newOrderNumber})`,
      text: `
New order #${newOrderNumber} at ${timestamp}

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

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email send error:", err);
    // proceed regardless
  }

  // 7) Done
  return res.status(200).json({ success: true, ordernumber: newOrderNumber });
}
