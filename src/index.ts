import "source-map-support/register";
import axios from "axios";
import * as cheerio from "cheerio";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const url = "https://www.kgv-anderdammstrasse.de/freie-parzellen/";

const filePath = path.join(__dirname, "parzellen.txt");

const smtpPort = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 587;

const smtpHost =
  process.env.SMTP_HOST ??
  (() => {
    throw new Error("SMTP_HOST is not defined");
  });
const userEmail =
  process.env.USER_EMAIL ??
  (() => {
    throw new Error("USER_EMAIL is not defined");
  })();
const userPassword =
  process.env.USER_PASSWORD ??
  (() => {
    throw new Error("USER_PASSWORD is not defined");
  })();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: smtpPort,
  secure: false,
  auth: {
    user: userEmail,
    pass: userPassword,
  },
  logger: true,
  debug: true,
});

async function checkForUpdates() {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const content = $("div.entry-content.col.cf").text();
    console.log(content);

    let oldContent = "";
    if (fs.existsSync(filePath)) {
      oldContent = fs.readFileSync(filePath, "utf-8");
    }

    if (oldContent !== content) {
      fs.writeFileSync(filePath, content);
      const mailOptions = {
        from: userEmail,
        to: process.env.RECIPIENT_EMAIL,
        subject: "Neue Parzellen verfügbar",
        text: content,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("E-Mail erfolgreich gesendet:", info.response);
    } else {
      console.log("Keine neuen Parzellen verfügbar.");
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Webseite:", error);
  }
}

// Funktion aufrufen, um den Test durchzuführen

checkForUpdates();
