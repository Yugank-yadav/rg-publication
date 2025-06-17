"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);

  // Simple state-based approach for testing
  const rotateX = (mousePos.y - 0.5) * -80; // -40 to 40 degrees
  const rotateY = (mousePos.x - 0.5) * 100; // -50 to 50 degrees
  const bookX = (mousePos.x - 0.5) * 50; // -25 to 25 pixels
  const bookY = (mousePos.y - 0.5) * 60; // -30 to 30 pixels

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    try {
      const rect = containerRef.current.getBoundingClientRect();
      // Normalize coordinates to 0-1 range
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      setMousePos({ x, y });
    } catch (error) {
      console.warn("Mouse tracking error:", error);
      // Fallback to center position
      setMousePos({ x: 0.5, y: 0.5 });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Smoothly return to center position when mouse leaves
    setMousePos({ x: 0.5, y: 0.5 });
  }, []);

  useEffect(() => {
    setIsClient(true);

    let currentContainer = null;

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      currentContainer = containerRef.current;
      if (currentContainer) {
        currentContainer.addEventListener("mousemove", handleMouseMove, {
          passive: true,
        });
        currentContainer.addEventListener("mouseleave", handleMouseLeave);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (currentContainer) {
        currentContainer.removeEventListener("mousemove", handleMouseMove);
        currentContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  const features = [
    {
      icon: BookOpenIcon,
      title: "Vast Collection",
      description: "Over 10,000+ books across all genres",
    },
    {
      icon: AcademicCapIcon,
      title: "Expert Curated",
      description: "Handpicked by education professionals",
    },
    {
      icon: SparklesIcon,
      title: "Interactive Learning",
      description: "Enhanced with digital resources",
    },
  ];

  if (!isClient) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-white overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Side - Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Discover Your Next
                <span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                  }}
                >
                  Great Read
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Explore thousands of books, from bestsellers to hidden gems.
                Your perfect book is waiting to be discovered in our curated
                collection.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
              >
                Browse Books
                <ArrowRightIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-300"
              >
                Start Learning
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex flex-col items-start space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "#a8f1ff20" }}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: "#a8f1ff" }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive 3D Book */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Enhanced 3D Book Container */}
            <motion.div
              className="relative w-80 h-96"
              style={{
                perspective: "1200px",
                x: bookX,
                y: bookY,
              }}
              animate={{
                rotateX: rotateX * 0.2, // Subtle container rotation
                rotateY: rotateY * 0.2,
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 200,
              }}
            >
              {/* Enhanced Dynamic Shadow */}
              <motion.div
                className="absolute inset-0 bg-black/25 blur-xl transform translate-y-8 scale-110"
                animate={{
                  rotateX: rotateX * 0.3,
                  rotateY: rotateY * 0.3,
                  x: rotateY * 0.5,
                  y: -rotateX * 0.3,
                }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 200,
                }}
              />

              {/* Main Book with Enhanced Rotation */}
              <motion.div
                className="relative w-full h-full transform-gpu"
                style={{
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  rotateX,
                  rotateY,
                }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 200,
                }}
              >
                {/* Book Cover */}
                <div
                  className="absolute inset-0 rounded-lg shadow-2xl transform-gpu"
                  style={{
                    background: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                    transform: "translateZ(20px)",
                  }}
                >
                  <div className="p-8 h-full flex flex-col justify-between text-white">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">The Art of</h3>
                      <h2 className="text-3xl font-bold">Learning</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-lg opacity-90">Interactive Edition</p>
                    </div>
                  </div>
                </div>

                {/* Book Spine */}
                <div
                  className="absolute left-0 top-0 w-6 h-full rounded-l-lg shadow-lg"
                  style={{
                    background: `linear-gradient(180deg, #2563eb 0%, #0891b2 100%)`,
                    transform: "rotateY(-90deg) translateZ(20px)",
                    transformOrigin: "left center",
                  }}
                />

                {/* Book Back */}
                <div
                  className="absolute inset-0 rounded-lg shadow-lg bg-gray-100"
                  style={{
                    transform: "translateZ(-20px) rotateY(180deg)",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-10 -left-10 w-16 h-16 rounded-full opacity-60"
              style={{ backgroundColor: "#a8f1ff40" }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute -bottom-10 -right-10 w-12 h-12 rounded-full opacity-40"
              style={{ backgroundColor: "#3b82f640" }}
              animate={{
                y: [0, 15, 0],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
