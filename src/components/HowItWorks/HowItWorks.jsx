import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiSearch, FiSend, FiBriefcase } from 'react-icons/fi';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      icon: FiUser,
      title: 'Create Your Profile',
      description: 'Sign up and build your professional profile with your skills, experience, and career preferences.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      action: 'Sign Up Now'
    },
    {
      icon: FiSearch,
      title: 'Search & Discover',
      description: 'Browse thousands of job opportunities or let our smart algorithm match you with relevant positions.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      action: 'Explore Jobs'
    },
    {
      icon: FiSend,
      title: 'Apply with Ease',
      description: 'Apply to multiple jobs with one click using our streamlined application process and CV builder.',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      action: 'Create CV'
    },
    {
      icon: FiBriefcase,
      title: 'Land Your Dream Job',
      description: 'Get hired by top companies and start your new career journey with our ongoing support.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      action: 'Get Started'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting your dream job is easier than ever. Follow these simple steps to connect with top employers and advance your career.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 to-orange-200 transform -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="text-center space-y-6">
                    {/* Step number */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="text-white text-2xl" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="pt-4">
                      <button className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${step.color} text-white font-medium rounded-xl hover:scale-105 transform transition-all duration-200 shadow-md`}>
                        {step.action}
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mobile connection line */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-8 mb-8">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200"></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Success Stories Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">
                Join 100,000+ Successful Job Seekers
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform has helped professionals from all backgrounds find their dream jobs at top companies worldwide.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-purple-600">30 Days</div>
                <div className="text-gray-600 font-medium">Average Time to Hire</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-green-600">$95k</div>
                <div className="text-gray-600 font-medium">Average Salary Increase</div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8">
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Your Journey
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 