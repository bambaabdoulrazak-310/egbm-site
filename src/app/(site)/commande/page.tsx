import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CommandeClient } from "@/components/site/CommandeClient";

export const metadata: Metadata = { title: "Votre commande" };
export const revalidate = 0;

export default async function CommandePage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Votre commande</h1>
      <CommandeClient products={products} />
    </div>
  );
}
