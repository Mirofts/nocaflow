// pages/api/send-email.js
import { Resend } from 'resend';
import { z } from "zod";
import { limiter } from "@/utils/rateLimiter";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase-admin";

// 🧱 1️⃣ SCHÉMA DE VALIDATION (empêche les données invalides ou dangereuses)
const EmailSchema = z.object({
  to: z.string().email(),
  fromEmail: z.string().email(),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  newContactName: z.string().optional(),
});

// 🔐 2️⃣ Initialisation de Resend (pour envoyer les emails)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // 🚫 3️⃣ Limite les abus (max 5 requêtes / minute)
  await limiter(req, res);

  // ✅ 4️⃣ Vérifie que la méthode HTTP est bien POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 🔑 5️⃣ Vérifie que l’utilisateur est connecté via Firebase
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    await getAuth(admin).verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired Firebase token" });
  }

  // 🧹 6️⃣ Vérifie que les données reçues sont propres et valides
  let body;
  try {
    body = EmailSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid input", details: err.errors });
  }

  const { to, fromEmail, subject, htmlContent, newContactName } = body;

  // ✉️ 7️⃣ Envoi de l’email via Resend
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    if (data && data.id) {
      console.log(`✅ Email envoyé via Resend à ${newContactName || to}:`, data);
      return res.status(200).json({ success: true, data });
    } else if (data && data.error) {
      console.error('Resend API Error:', data.error);
      return res.status(data.error.statusCode || 500).json({ error: data.error.message || 'Failed to send email via Resend.' });
    } else {
      console.error('Resend API: Unexpected response:', data);
      return res.status(500).json({ error: 'Unexpected response from Resend.' });
    }
  } catch (error) {
    console.error('Server-side email sending error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error while sending email.';
    return res.status(statusCode).json({ error: message });
  }
}
