import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/* App initialization FIRST */
const app = express();
const PORT = process.env.PORT || 3000;

/*  Middleware AFTER app is created */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*  Health endpoints */
app.get("/", (req, res) => {
  res.send(" EarthLabs CRM API running");
});

app.get("/company", (req, res) => {
  res.send(" Use POST /company");
});

/*  Slack Slash Command endpoint */
app.post("/company", async (req, res) => {
  try {
    const text = req.body.text;
    const user = req.body.user_name || "unknown";

    console.log("Slack payload:", req.body);

    if (!text) {
      return res.send(" No input received from Slack");
    }

    const [companyName, website] = text.trim().split(/\s+/);

    if (!companyName || !website) {
      return res.send(" Usage: /company <Company_Name> <Website>");
    }

    await axios({
      method: "post",
      url: process.env.APPS_SCRIPT_URL,
      maxRedirects: 5,
      headers: { "Content-Type": "application/json" },
      data: {
        dateAdded: new Date().toISOString().split("T")[0],
        companyName,
        website,
        deadAlive: "Alive",
        remarks: `Added by ${user}`
      },
      timeout: 3000
    });

    return res.send(` Company added: ${companyName}`);
  } catch (err) {
    console.error("CRM ERROR:", err.message);
    console.error(err.response?.data);

    return res.send(" Error adding company to CRM");
  }
});

/*  Start server LAST */
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
