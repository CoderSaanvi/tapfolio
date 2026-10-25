import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sora" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "Tapfolio",
  description: "A tap-to-share contact card that opens a live portfolio.",
  applicationName: "Tapfolio",
  appleWebApp: { capable: true, title: "Tapfolio", statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-touch-icon.png", icon: "/icon-192.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
