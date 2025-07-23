import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiPieChart, FiPenTool, FiShield, FiTrendingUp, FiUsers, FiSettings, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';

const JobCategories = () => {
  const categories = [
    {
      icon: FiCode,
      title: 'Technology',
      count: '12,000+ jobs',
      description: 'Software development, DevOps, AI & Machine Learning',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: FiPieChart,
      title: 'Data & Analytics',
      count: '8,500+ jobs',
      description: 'Data Science, Business Intelligence, Research',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: FiPenTool,
      title: 'Design & Creative',
      count: '6,200+ jobs',
      description: 'UI/UX Design, Graphic Design, Creative Direction',
      color: 'from-pink-500 to-red-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      icon: FiTrendingUp,
      title: 'Marketing & Sales',
      count: '9,800+ jobs',
      description: 'Digital Marketing, Sales, Growth Strategy',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      icon: FiUsers,
      title: 'Human Resources',
      count: '4,100+ jobs',
      description: 'HR Management, Recruiting, People Operations',
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      icon: FiShield,
      title: 'Finance & Accounting',
      count: '7,300+ jobs',
      description: 'Financial Analysis, Accounting, Investment',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      icon: FiSettings,
      title: 'Operations',
      count: '5,600+ jobs',
      description: 'Project Management, Operations, Supply Chain',
      color: 'from-gray-500 to-gray-700',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    },
    {
      icon: FiGlobe,
      title: 'Remote Work',
      count: '15,000+ jobs',
      description: 'Work from anywhere opportunities',
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
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
            Explore Job Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover opportunities across various industries and find the perfect role that matches your skills and interests.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <Link
                  to={`/jobsearch?category=${encodeURIComponent(category.title)}`}
                  className="block"
                >
                  <div className={`${category.bgColor} rounded-2xl p-6 h-full border border-gray-100 hover:shadow-lg transition-all duration-300`}>
                    <div className="space-y-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="text-white text-xl" />
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className={`text-lg font-semibold ${category.textColor} group-hover:text-gray-900 transition-colors`}>
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {category.count}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                        <span>Explore jobs</span>
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/jobsearch"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            View All Jobs
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default JobCategories; 