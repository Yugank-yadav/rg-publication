"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "./avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "./dropdown";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
  MobileMenuButton,
} from "./navbar";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import { InboxIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

// Custom animated tab component for desktop with sliding underline and bounce
function AnimatedTab({ children, isActive, onClick, className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium
        transition-colors 
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
    </motion.button>
  );
}

// Mobile animated tab component with sliding underline and bounce
function MobileAnimatedTab({ children, isActive, onClick, className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative block w-full text-left px-3 py-3 rounded-md text-base font-medium
        transition-colors
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
    </motion.button>
  );
}

export default function MainNavbar() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Home" },
    { id: "events", label: "Events" },
    { id: "orders", label: "Orders" },
    { id: "analytics", label: "Analytics" },
  ];

  // Create mobile menu items
  const mobileMenuItems = (
    <div className="space-y-1">
      {navItems.map((item) => (
        <MobileAnimatedTab
          key={item.id}
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </MobileAnimatedTab>
      ))}
    </div>
  );

  return (
    <Navbar mobileMenuItems={mobileMenuItems}>
      {/* Mobile menu button */}
      <MobileMenuButton />

      {/* Left side - Team/Brand dropdown */}
      <Dropdown>
        <DropdownButton as={NavbarItem}>
          <Avatar src="/next.svg" alt="Company Logo" size="sm" />
          <NavbarLabel>Your Company</NavbarLabel>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </DropdownButton>
        <DropdownMenu className="min-w-64" anchor="bottom start">
          <DropdownItem>
            <Cog8ToothIcon className="h-4 w-4 text-gray-500" />
            <DropdownLabel>Settings</DropdownLabel>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>
            <Avatar src="/next.svg" size="sm" />
            <DropdownLabel>Your Company</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Avatar
              initials="TC"
              className="bg-purple-500 text-white"
              size="sm"
            />
            <DropdownLabel>Team Collaboration</DropdownLabel>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>
            <PlusIcon className="h-4 w-4 text-gray-500" />
            <DropdownLabel>New team&hellip;</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <NavbarDivider className="max-lg:hidden" />

      {/* Center - Main navigation with animated tabs */}
      <NavbarSection className="max-lg:hidden relative">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <AnimatedTab
              key={item.id}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </AnimatedTab>
          ))}
        </div>
      </NavbarSection>

      <NavbarSpacer />

      {/* Right side - Actions and user menu */}
      <NavbarSection>
        <NavbarItem aria-label="Search">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </NavbarItem>
        <NavbarItem aria-label="Inbox">
          <InboxIcon className="h-5 w-5" />
        </NavbarItem>

        {/* User dropdown */}
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar src="/profile.svg" square size="sm" />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom end">
            <DropdownItem>
              <UserIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Cog8ToothIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>Privacy policy</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <LightBulbIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>Share feedback</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <ArrowRightStartOnRectangleIcon className="h-4 w-4 text-gray-500" />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
