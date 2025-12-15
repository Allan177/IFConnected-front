/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- ADICIONE ESTE BLOCO ---
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000", // Porta do MinIO API
        pathname: "/ifconnected-images/**", // Autoriza APENAS o bucket de imagens
      },
      // Permite imagens externas de sites como GitHub, Unsplash, etc.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // --------------------------
};

module.exports = nextConfig; // Se for .js
// ou export default nextConfig; // Se for .mjs
