import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

async function getNotifiableEmails(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { notifyByEmail: true },
    select: { email: true },
  });
  return users.map((u) => u.email);
}

function wrap(title: string, rows: Array<[string, string]>) {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#57544C;font-size:13px;white-space:nowrap;">${label}</td><td style="padding:4px 0;font-size:14px;">${value}</td></tr>`
    )
    .join("");
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #E8681E;">${title}</h2>
      <table>${rowsHtml}</table>
      <p style="margin-top:16px;">
        <a href="https://www.egbmci.com/espace-entreprise" style="display: inline-block; background: #128A4C; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Voir dans l'espace entreprise
        </a>
      </p>
    </div>
  `;
}

export async function notifyNewOrder(order: {
  clientName: string;
  clientPhone: string;
  clientAddress: string | null;
  total: number;
}) {
  const emails = await getNotifiableEmails();
  if (emails.length === 0) return;
  await sendEmail(
    emails,
    "Nouvelle commande — EGBM",
    wrap("Nouvelle commande reçue", [
      ["Client", order.clientName],
      ["Téléphone", order.clientPhone],
      ["Adresse", order.clientAddress ?? "—"],
      ["Total", `${order.total.toLocaleString("fr-FR")} FCFA`],
    ])
  );
}

export async function notifyNewQuoteRequest(quote: {
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  message: string;
}) {
  const emails = await getNotifiableEmails();
  if (emails.length === 0) return;
  await sendEmail(
    emails,
    "Nouvelle demande de devis — EGBM",
    wrap("Nouvelle demande de devis", [
      ["Client", quote.clientName],
      ["Téléphone", quote.clientPhone],
      ["Email", quote.clientEmail ?? "—"],
      ["Besoin", quote.message],
    ])
  );
}

export async function notifyNewContactMessage(contact: { name: string; message: string }) {
  const emails = await getNotifiableEmails();
  if (emails.length === 0) return;
  await sendEmail(
    emails,
    "Nouveau message de contact — EGBM",
    wrap("Nouveau message de contact", [
      ["Nom", contact.name],
      ["Message", contact.message],
    ])
  );
}
