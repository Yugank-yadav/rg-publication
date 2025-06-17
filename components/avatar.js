"use client";

import { forwardRef } from "react";
import Image from "next/image";

const Avatar = forwardRef(function Avatar(
  {
    src,
    alt = "",
    initials,
    square = false,
    className = "",
    size = "md",
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
    xl: "h-12 w-12 text-lg",
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium text-white
    ${square ? "rounded-md" : "rounded-full"}
    ${sizeClasses[size]}
    ${className}
  `;

  if (src) {
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        width={48}
        height={48}
        className={`${baseClasses} object-cover`}
        {...props}
      />
    );
  }

  if (initials) {
    return (
      <div ref={ref} className={`${baseClasses} bg-gray-500`} {...props}>
        {initials}
      </div>
    );
  }

  // Default avatar with user icon
  return (
    <div ref={ref} className={`${baseClasses} bg-gray-500`} {...props}>
      <svg className="h-3/5 w-3/5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
});

export { Avatar };
