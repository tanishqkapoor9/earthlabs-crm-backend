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
  res.send(" EarthLabs CRM API running");
});

app.get("/company", (req, res) => {
  res.send(" Use POST /company");
});


app.post("/company", (req, res) => {
  const text = req.body.text;
  const user = req.body.user_name || "unknown";

  if (!text) {
    return res.send(" No input received");
  }

  const parts = text.trim().split(/\s+/);
  const companyName = parts[0];
  const website = parts[1];

  if (!companyName || !website) {
    return res.send(
      " Usage: /company <Company_Name> <Website>\nExample: /company Stripe https://stripe.com"
    );
  }

  (async () => {
    try {
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
          remarks: `Added by ${user}`,
        },
        timeout: 10000,
      });

      console.log(` Company saved: ${companyName}`);
    } catch (err) {
      console.error(" Background CRM error:", err.message);
      console.error(err.response?.data);
    }
  })();
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
