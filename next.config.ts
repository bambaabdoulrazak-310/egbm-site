import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet au tunnel Cloudflare (démo publique temporaire) d'appeler le
  // serveur de dev — sans ça, Next.js bloque silencieusement les Server
  // Actions envoyées depuis une origine différente de localhost.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
