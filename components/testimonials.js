"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  StarIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

export default function Testimonials() {
  // Static data for testimonials
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "High School Teacher",
      company: "Lincoln High School",
      rating: 5,
      text: "The quality of educational materials from this publication house is outstanding. My students have shown remarkable improvement since we started using their interactive learning resources.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&auto=format&face=center",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      title: "University Professor",
      company: "Stanford University",
      rating: 5,
      text: "As an educator for over 20 years, I can confidently say these publications set the gold standard for academic excellence. The research depth and clarity are unmatched.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format&face=center",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Parent & Homeschool Educator",
      company: "Homeschool Network",
      rating: 5,
      text: "These books have transformed our homeschooling experience. The engaging content and practical exercises keep my children motivated and excited about learning.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format&face=center",
    },
    {
      id: 4,
      name: "James Wilson",
      title: "School Principal",
      company: "Riverside Elementary",
      rating: 5,
      text: "We've seen a 40% improvement in student engagement since adopting these materials. The interactive elements and modern approach to education are exactly what we needed.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format&face=center",
    },
    {
      id: 5,
      name: "Lisa Thompson",
      title: "Curriculum Coordinator",
      company: "Metro School District",
      rating: 5,
      text: "The comprehensive curriculum support and teacher resources have made implementation seamless across our entire district. Highly recommended for any educational institution.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format&face=center",
    },
    {
      id: 6,
      name: "Robert Kim",
      title: "College Student",
      company: "MIT",
      rating: 5,
      text: "These textbooks made complex concepts accessible and engaging. The clear explanations and practical examples helped me excel in my advanced courses.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format&face=center",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const testimonialVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }
    return stars;
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-green-50/30 via-white to-teal-50/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#10b981" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "#14b8a6" }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "#a8f1ff20" }}
            whileHover={{ scale: 1.05 }}
          >
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">
              What Our Customers Say
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Customer{" "}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from educators, students, and parents who have experienced the
            transformative power of our educational publications.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={testimonialVariants}
              className="group relative"
            >
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 h-full transition-all duration-300"
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
                }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                }}
              >
                {/* Quote Icon */}
                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#a8f1ff20" }}
                  >
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-teal-500" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={testimonial.avatar}
                      alt={`${testimonial.name} avatar`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
            whileHover={{
              scale: 1.05,
              y: -2,
            }}
            whileTap={{ scale: 0.95 }}
          >
            Share Your Experience
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
