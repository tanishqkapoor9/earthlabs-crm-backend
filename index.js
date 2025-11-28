import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Health */
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

/* Slack Slash Command */
app.post("/company", (req, res) => {
  const text = req.body.text;
  const user = req.body.user_name || "unknown";

  /*  1. IMMEDIATE ACK (THIS FIXES operation_timeout) */
  res.status(200).send("");

  if (!text) return;

  const [companyName, website] = text.trim().split(/\s+/);
  if (!companyName || !website) return;

  /*  2. BACKGROUND TASK */
  setImmediate(async () => {
    try {
      await axios.post(process.env.APPS_SCRIPT_URL, {
        dateAdded: new Date().toISOString().split("T")[0],
        companyName,
        website,
        deadAlive: "Alive",
        remarks: `Added by ${user}`
      }, {
        maxRedirects: 5,
        timeout: 10000
      });

      console.log(` Saved: ${companyName}`);
    } catch (err) {
      console.error(" CRM ERROR:", err.message);
    }
  });
});

/* Start server */
app.listen(PORT, () => {
  console.log(` Server running on ${PORT}`);
});
