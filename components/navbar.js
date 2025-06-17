"use client";

import { createContext, useContext, useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const NavbarContext = createContext();

function Navbar({ children, mobileMenuItems, className = "" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <NavbarContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 ${className}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {children}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm"
            >
              <div className="px-4 py-3 space-y-1">{mobileMenuItems}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </NavbarContext.Provider>
  );
}

const NavbarItem = forwardRef(function NavbarItem(
  { href, current = false, children, className = "", ...props },
  ref
) {
  const Component = href ? "a" : "button";

  return (
    <Component
      ref={ref}
      href={href}
      className={`
        inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          current
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
});

function NavbarSection({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>{children}</div>
  );
}

function NavbarSpacer() {
  return <div className="flex-1" />;
}

function NavbarDivider({ className = "" }) {
  return <div className={`h-6 w-px bg-gray-300 ${className}`} />;
}

function NavbarLabel({ children, className = "" }) {
  return (
    <span className={`text-sm font-medium text-gray-900 ${className}`}>
      {children}
    </span>
  );
}

function MobileMenuButton({ className = "" }) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(NavbarContext);

  return (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className={`
        lg:hidden inline-flex items-center justify-center rounded-md p-2
        text-gray-700 hover:bg-gray-100 hover:text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      <span className="sr-only">Open main menu</span>
      {isMobileMenuOpen ? (
        <XMarkIcon className="h-6 w-6" />
      ) : (
        <Bars3Icon className="h-6 w-6" />
      )}
    </button>
  );
}

export {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  NavbarDivider,
  NavbarLabel,
  MobileMenuButton,
  NavbarContext,
};
