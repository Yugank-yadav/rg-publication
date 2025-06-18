import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNavbar from "@/components/main-navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RG Publication - Educational Books & Resources",
  description:
    "Discover quality educational books and resources. Interactive 3D website featuring bestsellers, trending products, and comprehensive learning materials.",
  keywords:
    "education, books, learning, textbooks, educational resources, RG Publication",
  author: "RG Publication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <MainNavbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
