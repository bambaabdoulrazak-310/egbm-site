import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProduitsClient } from "@/components/site/ProduitsClient";

export const metadata: Metadata = { title: "Produits" };
export const revalidate = 0;

export default async function ProduitsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true, price: true, stock: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Produits</h1>
      <ProduitsClient products={products} />
    </div>
  );
}
