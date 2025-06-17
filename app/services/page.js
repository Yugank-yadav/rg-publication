"use client";

import { motion } from "framer-motion";
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ComputerDesktopIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function ServicesPage() {
  const services = [
    {
      icon: BookOpenIcon,
      title: "Educational Publishing",
      description: "Comprehensive textbooks and learning materials for all academic levels.",
      features: ["Curriculum-aligned content", "Expert authors", "Quality assurance"]
    },
    {
      icon: ComputerDesktopIcon,
      title: "Digital Resources",
      description: "Interactive digital content and e-learning platforms.",
      features: ["Online assessments", "Interactive media", "Mobile compatibility"]
    },
    {
      icon: AcademicCapIcon,
      title: "Teacher Training",
      description: "Professional development programs for educators.",
      features: ["Workshop sessions", "Certification programs", "Ongoing support"]
    },
    {
      icon: UserGroupIcon,
      title: "Institutional Support",
      description: "Customized solutions for schools and educational institutions.",
      features: ["Bulk ordering", "Custom content", "Implementation support"]
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: "Assessment Tools",
      description: "Comprehensive evaluation and testing materials.",
      features: ["Standardized tests", "Progress tracking", "Analytics dashboard"]
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Consultation Services",
      description: "Expert guidance for curriculum development and educational strategy.",
      features: ["Curriculum design", "Educational consulting", "Strategic planning"]
    }
  ];

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
              Our{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{
                  backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                }}
              >
                Services
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Comprehensive educational solutions designed to support learning and 
              teaching excellence across all levels of education.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: "#a8f1ff20" }}
                  >
                    <service.icon className="h-6 w-6" style={{ color: "#a8f1ff" }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                </div>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#a8f1ff" }}></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
