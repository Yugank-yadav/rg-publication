"use client";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownContext,
} from "./dropdown";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
  MobileMenuButton,
  NavbarContext,
} from "./navbar";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
  CalculatorIcon,
  BeakerIcon,
  ShoppingBagIcon,
  HeartIcon,
} from "@heroicons/react/16/solid";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";

// Custom animated tab component for desktop with sliding underline and bounce
function AnimatedTab({ children, isActive, href, className = "" }) {
  return (
    <Link href={href} className="inline-block">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`
          relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium
          transition-colors cursor-pointer
          ${isActive ? "text-gray-900" : "text-gray-700 hover:text-gray-900"}
          ${className}
        `}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="activeTabUnderline"
            className="absolute bottom-0 left-0 right-0 h-1 rounded-t-sm"
            style={{ backgroundColor: "#a8f1ff" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </motion.div>
    </Link>
  );
}

// Shop dropdown content component that has access to DropdownContext
function ShopDropdownContent() {
  const { setIsOpen } = useContext(DropdownContext);

  // Handle click on dropdown navigation items to auto-close dropdown
  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu className="min-w-80" anchor="bottom start">
      {/* Mathematics Section */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <CalculatorIcon className="h-4 w-4 text-blue-500" />
          <DropdownLabel className="font-semibold">Mathematics</DropdownLabel>
        </div>
        <div className="grid grid-cols-4 gap-1 ml-6">
          {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
            <Link
              key={`math-${classNum}`}
              href={`/shop?subject=Mathematics&class=${classNum}`}
              onClick={handleNavItemClick}
              className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-center transition-colors"
            >
              Class {classNum}
            </Link>
          ))}
        </div>
      </div>

      <DropdownDivider />

      {/* Science Section */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <BeakerIcon className="h-4 w-4 text-green-500" />
          <DropdownLabel className="font-semibold">Science</DropdownLabel>
        </div>
        <div className="grid grid-cols-4 gap-1 ml-6">
          {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
            <Link
              key={`science-${classNum}`}
              href={`/shop?subject=Science&class=${classNum}`}
              onClick={handleNavItemClick}
              className="text-xs px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-center transition-colors"
            >
              Class {classNum}
            </Link>
          ))}
        </div>
      </div>

      <DropdownDivider />

      {/* All Books Link */}
      <DropdownItem>
        <Link href="/shop" className="flex items-center gap-2 w-full">
          <ShoppingBagIcon className="h-4 w-4" style={{ color: "#a8f1ff" }} />
          <DropdownLabel>View All Books</DropdownLabel>
        </Link>
      </DropdownItem>
    </DropdownMenu>
  );
}

// Shop dropdown tab component with two-level dropdown
function ShopDropdownTab({ isActive, className = "" }) {
  return (
    <Dropdown>
      <DropdownButton as="div">
        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`
            relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium
            transition-colors cursor-pointer
            ${isActive ? "text-gray-900" : "text-gray-700 hover:text-gray-900"}
            ${className}
          `}
        >
          Shop
          <ChevronDownIcon className="h-4 w-4" />
          {isActive && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-sm"
              style={{ backgroundColor: "#a8f1ff" }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
        </motion.div>
      </DropdownButton>
      <ShopDropdownContent />
    </Dropdown>
  );
}

// Mobile animated tab component with sliding underline and bounce
// Enhanced with auto-close functionality for better mobile UX
function MobileAnimatedTab({ children, isActive, href, className = "" }) {
  const { setIsMobileMenuOpen } = useContext(NavbarContext);

  const handleClick = () => {
    // Auto-close the mobile hamburger menu when a navigation item is clicked
    // This provides the expected mobile navigation behavior
    setIsMobileMenuOpen(false);
  };

  return (
    <Link href={href} className="block w-full" onClick={handleClick}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`
          relative block w-full text-left px-3 py-3 rounded-md text-base font-medium
          transition-colors cursor-pointer
          ${isActive ? "text-gray-900" : "text-gray-700 hover:text-gray-900"}
          ${className}
        `}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="activeMobileTabUnderline"
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-sm"
            style={{ backgroundColor: "#a8f1ff" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </motion.div>
    </Link>
  );
}

// Mobile Shop dropdown component with expandable categories
function MobileShopTab({ isActive, className = "" }) {
  const { setIsMobileMenuOpen } = useContext(NavbarContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleMainClick}
        className={`
          relative block w-full text-left px-3 py-3 rounded-md text-base font-medium
          transition-colors cursor-pointer flex items-center justify-between
          ${isActive ? "text-gray-900" : "text-gray-700 hover:text-gray-900"}
          ${className}
        `}
      >
        <span>Shop</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </motion.div>
        {isActive && (
          <motion.div
            layoutId="activeMobileTabUnderline"
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-sm"
            style={{ backgroundColor: "#a8f1ff" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 mt-2 space-y-3"
          >
            {/* Mathematics Section */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-3">
                <CalculatorIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-900">
                  Mathematics
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 px-3">
                {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                  <Link
                    key={`mobile-math-${classNum}`}
                    href={`/shop?subject=Mathematics&class=${classNum}`}
                    onClick={handleSubItemClick}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-center transition-colors"
                  >
                    Class {classNum}
                  </Link>
                ))}
              </div>
            </div>

            {/* Science Section */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-3">
                <BeakerIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-900">
                  Science
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 px-3">
                {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                  <Link
                    key={`mobile-science-${classNum}`}
                    href={`/shop?subject=Science&class=${classNum}`}
                    onClick={handleSubItemClick}
                    className="text-xs px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-center transition-colors"
                  >
                    Class {classNum}
                  </Link>
                ))}
              </div>
            </div>

            {/* View All Books */}
            <div className="px-3">
              <Link
                href="/shop"
                onClick={handleSubItemClick}
                className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ShoppingBagIcon
                  className="h-4 w-4"
                  style={{ color: "#a8f1ff" }}
                />
                <span className="text-sm font-medium">View All Books</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MainNavbar() {
  const pathname = usePathname();
  const { getCartTotals } = useCart();
  const { itemCount } = getCartTotals();
  const { user, isAuthenticated, logout } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { showSuccess } = useToast();
  const wishlistCount = getWishlistCount();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Successfully logged out. See you soon!");
    } catch (error) {
      logger.error("Logout error:", error);
    }
  };

  // Navigation items with proper routes
  const navItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About", href: "/about" },
    { id: "shop", label: "Shop", href: "/shop" },
    { id: "services", label: "Services", href: "/services" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    const currentItem = navItems.find((item) => {
      if (item.href === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(item.href);
    });
    return currentItem?.id || "home";
  };

  const activeTab = getActiveTab();

  // Create mobile menu items
  const mobileMenuItems = (
    <div className="space-y-1">
      {navItems.map((item) => {
        if (item.id === "shop") {
          return (
            <MobileShopTab key={item.id} isActive={activeTab === item.id} />
          );
        }
        return (
          <MobileAnimatedTab
            key={item.id}
            isActive={activeTab === item.id}
            href={item.href}
          >
            {item.label}
          </MobileAnimatedTab>
        );
      })}
    </div>
  );

  return (
    <Navbar mobileMenuItems={mobileMenuItems}>
      {/* Mobile menu button */}
      <MobileMenuButton />

      {/* Left side - Brand/Logo */}
      <Link href="/" className="flex items-center gap-3">
        <Avatar src="/next.svg" alt="RG Publication Logo" size="sm" />
        <NavbarLabel className="font-bold text-lg">RG Publication</NavbarLabel>
      </Link>

      {/* Company dropdown (optional) */}
      {/* <Dropdown>
        <DropdownButton as={NavbarItem}>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </DropdownButton>
        <DropdownMenu className="min-w-64" anchor="bottom start">
          <DropdownItem>
            <Link href="/about" className="flex items-center gap-2 w-full">
              <Cog8ToothIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>About Us</DropdownLabel>
            </Link>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>
            <Link href="/shop" className="flex items-center gap-2 w-full">
              <Avatar src="/next.svg" size="sm" />
              <DropdownLabel>Our Books</DropdownLabel>
            </Link>
          </DropdownItem>
          <DropdownItem>
            <Link href="/services" className="flex items-center gap-2 w-full">
              <Avatar
                initials="RG"
                className="text-white"
                style={{ backgroundColor: "#a8f1ff" }}
                size="sm"
              />
              <DropdownLabel>Services</DropdownLabel>
            </Link>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>
            <Link href="/contact" className="flex items-center gap-2 w-full">
              <PlusIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>Contact Us</DropdownLabel>
            </Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>*/}

      <NavbarDivider className="max-lg:hidden" />

      {/* Center - Main navigation with animated tabs */}
      <NavbarSection className="max-lg:hidden relative">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.id === "shop") {
              return (
                <ShopDropdownTab
                  key={item.id}
                  isActive={activeTab === item.id}
                />
              );
            }
            return (
              <AnimatedTab
                key={item.id}
                isActive={activeTab === item.id}
                href={item.href}
              >
                {item.label}
              </AnimatedTab>
            );
          })}
        </div>
      </NavbarSection>

      <NavbarSpacer />

      {/* Right side - Actions and user menu */}
      <NavbarSection>
        <NavbarItem aria-label="Search">
          <Link href="/search">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
        </NavbarItem>

        {/* Wishlist - only show if authenticated */}
        {isAuthenticated && (
          <NavbarItem aria-label="Wishlist">
            <Link href="/wishlist" className="relative">
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
          </NavbarItem>
        )}

        <NavbarItem aria-label="Shopping Cart">
          <Link href="/cart" className="relative">
            <ShoppingCartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </NavbarItem>

        {/* User dropdown */}
        {isAuthenticated ? (
          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar
                initials={
                  user
                    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                    : "U"
                }
                className="text-white"
                style={{ backgroundColor: "#a8f1ff" }}
                size="sm"
              />
            </DropdownButton>
            <DropdownMenu className="min-w-64" anchor="bottom end">
              <div className="px-3 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <DropdownItem>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 w-full"
                >
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <DropdownLabel>My Profile</DropdownLabel>
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Link
                  href="/profile?tab=orders"
                  className="flex items-center gap-2 w-full"
                >
                  <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
                  <DropdownLabel>My Orders</DropdownLabel>
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Link
                  href="/profile?tab=wishlist"
                  className="flex items-center gap-2 w-full"
                >
                  <HeartIcon className="h-4 w-4 text-gray-500" />
                  <DropdownLabel>My Wishlist</DropdownLabel>
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Link
                  href="/profile?tab=addresses"
                  className="flex items-center gap-2 w-full"
                >
                  <Cog8ToothIcon className="h-4 w-4 text-gray-500" />
                  <DropdownLabel>Addresses</DropdownLabel>
                </Link>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem>
                <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                <DropdownLabel>Privacy Policy</DropdownLabel>
              </DropdownItem>
              <DropdownItem>
                <LightBulbIcon className="h-4 w-4 text-gray-500" />
                <DropdownLabel>Share Feedback</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout}>
                <ArrowRightStartOnRectangleIcon className="h-4 w-4 text-gray-500" />
                <DropdownLabel>Sign Out</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          </NavbarItem>
        )}
      </NavbarSection>
    </Navbar>
  );
}
