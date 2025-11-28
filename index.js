import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.status(200).send(" EarthLabs CRM API running");
});

app.get("/company", (req, res) => {
  res.status(200).send("Use POST /company");
});
app.post("/company", (req, res) => {
  const text = req.body.text;
  const user = req.body.user_name || "unknown";
  const responseUrl = req.body.response_url;

  //  1. Immediate ACK to Slack (NO TIMEOUT EVER)
  res.status(200).send("");

  if (!text) return;

  const parts = text.trim().split(/\s+/);
  const companyName = parts[0];
  const website = parts[1];

  if (!companyName || !website) return;

  //  2. Background processing
  setImmediate(async () => {
    try {
      const response = await axios.post(
        process.env.APPS_SCRIPT_URL,
        {
          dateAdded: new Date().toISOString().split("T")[0],
          companyName,
          website,
          deadAlive: "Alive",
          communicationStatus: "Not Started",
          communicatingVia: "Slack",
          remarks: `Added by ${user}`
        },
        {
          maxRedirects: 5,
          timeout: 10000
        }
      );

      if (response.data === "DUPLICATE") {
        await axios.post(responseUrl, {
          text: ` *${companyName}* already exists in CRM`
        });
      } else {
        await axios.post(responseUrl, {
          text: ` *${companyName}* added successfully to CRM`
        });
      }

    } catch (err) {
      console.error(" CRM ERROR:", err.message);
      await axios.post(responseUrl, {
        text: ` Failed to add *${companyName}* to CRM`
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
