"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{
                  backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                }}
              >
                RG Publication
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Empowering education through innovative publications and digital
              resources. We&apos;re committed to providing high-quality
              educational materials that inspire learning and academic
              excellence.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6">
                At RG Publication, we believe that quality education is the
                foundation of a better future. Our mission is to create and
                distribute educational materials that make learning engaging,
                accessible, and effective for students and educators worldwide.
              </p>
              <p className="text-gray-600">
                With over a decade of experience in educational publishing, we
                continue to innovate and adapt to the changing needs of modern
                education.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose Us?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#a8f1ff" }}
                  ></div>
                  <span className="text-gray-700">Expert-curated content</span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#a8f1ff" }}
                  ></div>
                  <span className="text-gray-700">
                    Interactive learning resources
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#a8f1ff" }}
                  ></div>
                  <span className="text-gray-700">Comprehensive support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#a8f1ff" }}
                  ></div>
                  <span className="text-gray-700">Affordable pricing</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
