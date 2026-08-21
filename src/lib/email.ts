import "server-only";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas défini.");
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? "EGBM <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject: "Réinitialisation de votre mot de passe — EGBM",
    html: `
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
    `,
  });
}
