// pages/api/send-email.js
import { Resend } from 'resend';

// Assurez-vous que RESEND_API_KEY est défini dans vos variables d'environnement de production.
// Sur Vercel, Netlify, ou si vous déployez Next.js sur un serveur Node.js (ex: Cloud Run via Firebase).
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, fromEmail, subject, htmlContent, newContactName } = req.body; // Ajout de newContactName pour la personnalisation du log

  // Validation simple des champs requis
  if (!to || !fromEmail || !subject || !htmlContent) {
    console.error('Missing required email parameters in request body:', { to, fromEmail, subject: !!subject, htmlContent: !!htmlContent });
    return res.status(400).json({ error: 'Missing required email parameters: to, fromEmail, subject, htmlContent' });
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail, // IMPORTANT: Doit être une adresse ou un domaine vérifié dans votre compte Resend
      to: to,
      subject: subject,
      html: htmlContent,
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      // Inclure le message d'erreur de Resend pour le débogage si nécessaire
      return res.status(data.statusCode || 500).json({ error: data.error.message || 'Failed to send email via Resend.' });
    }

    console.log(`Email d'invitation envoyé via Resend à ${newContactName || to}:`, data);
    return res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error('Server-side email sending error (catch block):', error);
    // Erreur générique en cas de problème inattendu
    return res.status(500).json({ error: 'Internal Server Error while sending email.' });
  }
}