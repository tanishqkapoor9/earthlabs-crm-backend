app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Slack sends slash command payload as x-www-form-urlencoded
 */
app.use(bodyParser.urlencoded({ extended: false }));

/**
 *  Health check (Render + browser)
 */
app.get("/", (req, res) => {
  res.send("EarthLabs CRM API is running");
});

/**
 * Health check for /company (GET)
 */
app.get("/company", (req, res) => {
  res.send(" Use POST /company");
});

/**
 *  Slack Slash Command Endpoint
 * Command: /company <Company_Name> <Website>
 */
app.post("/company", async (req, res) => {
    console.log("SLACK BODY:", req.body);
  try {
    const text = req.body.text || "";
    const user = req.body.user_name || "unknown";

    const parts = text.trim().split(/\s+/);

    if (parts.length < 2) {
      return res.send(
        " Usage: /company <Company_Name> <Website>\nExample: /company Stripe https://stripe.com"
      );
    }

    const companyName = parts[0];
    const website = parts[1];

    //  Forward data to Google Apps Script
    await axios({
      method: "post",
      url: process.env.APPS_SCRIPT_URL,
      maxRedirects: 5, // Google redirect-safe
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        dateAdded: new Date().toISOString().split("T")[0],
        companyName: companyName,
        sector: "",
        type: "",
        website: website,
        deadAlive: "Alive",
        communicationStatus: "Not Started",
        communicatingVia: "Slack",
        poc: "",
        pocLinkedin: "",
        remarks: `Added by ${user}`,
      },
      timeout: 2000 //  Slack 3-second rule safe
    });

    //  Immediate Slack response
    return res.send(
      `Company added successfully\n• ${companyName}\n• ${website}`
    );
  } catch (error) {
    console.error(
      "ERROR:",
      error.response?.data || error.message
    );

    return res.send(" Error adding company to CRM");
  }
});

/**
 *  Start server (Render compatible)
 */
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
