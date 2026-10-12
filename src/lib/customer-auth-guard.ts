import "server-only";
import { redirect } from "next/navigation";
import { getCustomerSession, type CustomerSessionPayload } from "@/lib/customer-session";

export async function requireCustomerSession(): Promise<CustomerSessionPayload> {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/compte/connexion");
  }
  return session;
}
