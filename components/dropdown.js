"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const DropdownContext = createContext();

function Dropdown({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

const DropdownButton = forwardRef(function DropdownButton(
  { as: Component = "button", children, className = "", ...props },
  ref
) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Component
      ref={ref}
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
        text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2
        focus:ring-blue-500 focus:ring-offset-2 transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
});

function DropdownMenu({
  children,
  className = "",
  anchor = "bottom start",
  ...props
}) {
  const { isOpen } = useContext(DropdownContext);

  const anchorClasses = {
    "bottom start": "top-full left-0 mt-2",
    "bottom end": "top-full right-0 mt-2",
    "top start": "bottom-full left-0 mb-2",
    "top end": "bottom-full right-0 mb-2",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`
            absolute z-[60] rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200
            ${anchorClasses[anchor]}
            ${className}
          `}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DropdownItem = forwardRef(function DropdownItem(
  { href, children, className = "", ...props },
  ref
) {
  const { setIsOpen } = useContext(DropdownContext);
  const Component = href ? "a" : "button";

  const handleClick = () => {
    setIsOpen(false);
  };

  return (
    <Component
      ref={ref}
      href={href}
      onClick={handleClick}
      className={`
        flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700
        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
});

function DropdownLabel({ children, className = "" }) {
  return <span className={`flex-1 ${className}`}>{children}</span>;
}

function DropdownDivider({ className = "" }) {
  return <div className={`my-1 h-px bg-gray-200 ${className}`} />;
}

export {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
  DropdownContext,
};
