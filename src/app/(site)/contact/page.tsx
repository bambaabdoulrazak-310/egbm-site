import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Contact</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-rust" /> Korhogo, Côte d&apos;Ivoire
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-rust" /> +225 07 08 47 85 37
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-rust" /> +225 05 56 80 42 86
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-rust" /> contact@egbm.ci
          </div>
          <a
            href="https://wa.me/2250556804286"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex w-fit items-center gap-2 rounded-md bg-green px-4 py-2 font-semibold text-white"
          >
            <MessageCircle size={18} /> Discuter sur WhatsApp
          </a>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
