import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import { CommandeClient } from "@/components/site/CommandeClient";

export const metadata: Metadata = { title: "Votre commande" };
export const revalidate = 0;

export default async function CommandePage() {
  const [products, customerSession] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, price: true } }),
    getCustomerSession(),
  ]);

  const customer = customerSession
    ? await prisma.customer.findUnique({
        where: { id: customerSession.sub },
        select: { name: true, phone: true, address: true },
      })
    : null;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Votre commande</h1>
      <CommandeClient products={products} customer={customer} />
    </div>
  );
}
