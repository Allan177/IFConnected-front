import { AuthProvider } from "@/contexts/AuthContext";
import NextThemeProvider from "@/contexts/ThemeProvider";
import "./globals.css";
import { Inter } from "next/font/google";
// 1. Import do Provider do Google
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IFConnected - A Rede Social do IF",
  description: "Conectando os campi da Paraíba e do Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* 2. Envolve a aplicação com o Client ID do Google */}
        <GoogleOAuthProvider clientId="541656136687-dj7v9udsuodhv8okd4a74n9rkfhfcvda.apps.googleusercontent.com">
          <NextThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </NextThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}