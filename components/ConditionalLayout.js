"use client";

import { usePathname } from "next/navigation";
import MainNavbar from "@/components/main-navbar";
import Footer from "@/components/footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith("/admin");
  
  if (isAdminRoute) {
    // Admin routes: No navbar, no footer, no padding
    return <main>{children}</main>;
  }
  
  // Public routes: Include navbar and footer with proper padding
  return (
    <>
      <MainNavbar />
      {/* <OfflineBanner /> */}
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
