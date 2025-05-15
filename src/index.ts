import "source-map-support/register";
import axios from "axios";
import * as cheerio from "cheerio";
import nodemailer, { TransportOptions } from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";

dotenv.config({ path: __dirname + '/../.env' });

const url = "https://www.kgv-anderdammstrasse.de/freie-parzellen/";

const filePath = path.join(__dirname, "parzellen.txt");

const smtpPort = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 587;

const smtpHost = process.env.SMTP_HOST;
if (!smtpHost) throw new Error("SMTP_HOST is not defined");
const userEmail = process.env.USER_EMAIL;
if (!userEmail) throw new Error("USER_EMAIL is not defined");

const userPassword = process.env.USER_PASSWORD;
if (!userPassword) throw new Error("USER_PASSWORD is not defined");

const options: SMTPTransport.Options = {
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: userEmail,
    pass: userPassword,
  },
};

const transporter = nodemailer.createTransport(options);

async function checkForUpdates() {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

    const content = $("div.entry-content.col.cf").text();

    if (content.includes("Momentan sind keine freien Parzellen abzugeben.")) {
      console.log("Keine Parzellen verfügbar - keine Mail versendet");
      return;
    }

    const match = content.match(
      /Folgende Gärten.*?(?=Bei Interesse|————————————————)/s
    );

    const filteredContent = match ? match[0].trim() : content.trim();
    const newContent = normalize(filteredContent);
    const oldContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf-8")
      : "";

    if (newContent !== oldContent) {
      fs.writeFileSync(filePath, content);
      const mailOptions = {
        from: userEmail,
        to: process.env.RECIPIENT_EMAIL,
        subject: "Neue Parzellen verfügbar",
        text: filteredContent,
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
