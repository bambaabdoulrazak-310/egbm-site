import "server-only";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas défini.");
  }
  return new Resend(apiKey);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Une nouvelle tentative après un court délai absorbe les échecs ponctuels
// (blip réseau, cold start juste après un déploiement, etc.).
export async function sendEmail(to: string | string[], subject: string, html: string) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? "EGBM <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw error;
  } catch (err) {
    console.error("Premier envoi d'email échoué, nouvelle tentative :", err);
    await sleep(1500);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw error;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Réinitialisation de votre mot de passe — EGBM",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #E8681E;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser le mot de passe de votre compte Espace Entreprise EGBM.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #128A4C; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="color: #57544C; font-size: 13px;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `
  );
}

export async function sendNewAccountEmail(to: string, name: string, temporaryPassword: string) {
  await sendEmail(
    to,
    "Votre accès à l'espace entreprise EGBM",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #E8681E;">Bienvenue, ${name}</h2>
        <p>Un compte vous a été créé sur l'espace entreprise EGBM.</p>
        <table style="margin: 16px 0;">
          <tr><td style="padding:4px 12px 4px 0;color:#57544C;font-size:13px;">Email</td><td style="padding:4px 0;font-size:14px;font-weight:bold;">${to}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#57544C;font-size:13px;">Mot de passe temporaire</td><td style="padding:4px 0;font-size:16px;font-weight:bold;font-family:monospace;">${temporaryPassword}</td></tr>
        </table>
        <p>
          <a href="https://www.egbmci.com/connexion" style="display: inline-block; background: #128A4C; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Se connecter
          </a>
        </p>
        <p style="color: #57544C; font-size: 13px;">Nous vous recommandons de changer ce mot de passe dès votre première connexion, depuis "Mon compte".</p>
      </div>
    `
  );
}
