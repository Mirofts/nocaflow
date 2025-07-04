// pages/api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, fromEmail, subject, htmlContent, newContactName } = req.body;

  if (!to || !fromEmail || !subject || !htmlContent) {
    console.error('Missing required email parameters in request body:', { to, fromEmail, subject: !!subject, htmlContent: !!htmlContent });
    return res.status(400).json({ error: 'Missing required email parameters: to, fromEmail, subject, htmlContent' });
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    // Resend renvoie data.error si succès est false
    if (data && data.id) { // Si l'envoi est réussi, il y a un ID de transaction
      console.log(`Email d'invitation envoyé via Resend à ${newContactName || to}:`, data);
      return res.status(200).json({ success: true, data: data });
    } else if (data && data.error) { // Si l'envoi a échoué, data contient un objet error
      console.error('Resend API Error (from data.error):', data.error);
      return res.status(data.error.statusCode || 500).json({ error: data.error.message || 'Failed to send email via Resend (data.error).' });
    } else {
      // Cas inattendu où data n'est ni un succès ni un échec clair
      console.error('Resend API: Unexpected response structure:', data);
      return res.status(500).json({ error: 'Failed to send email via Resend (unexpected response).' });
    }

  } catch (error) {
    console.error('Server-side email sending error (catch block):', error);
    // Erreur générique en cas de problème inattendu
    // Les erreurs de Resend peuvent avoir un `statusCode` directement sur l'objet error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error while sending email.';
    return res.status(statusCode).json({ error: message });
  }
}