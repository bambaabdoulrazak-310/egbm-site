import { requireSession } from "@/lib/auth-guard";
import { EntrepriseNav } from "@/components/entreprise/EntrepriseNav";

export default async function EspaceEntrepriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <EntrepriseNav userName={session.name} role={session.role} />
      <main className="flex-1 overflow-x-hidden bg-bg-alt p-4 sm:p-6">{children}</main>
    </div>
  );
}
