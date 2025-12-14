import { AuthProvider } from "@/contexts/AuthContext";
import NextThemeProvider from "@/contexts/ThemeProvider";
import "./globals.css";
import { Inter } from "next/font/google";

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
        {/* Envolve toda a aplicação com o provedor de tema */}
        <NextThemeProvider>
          {/* Envolve toda a aplicação com o provedor de autenticação */}
          <AuthProvider>{children}</AuthProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
