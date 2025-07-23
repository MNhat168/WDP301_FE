import React from 'react';
import { FiBriefcase, FiUsers, FiHome, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Statistics = () => {
  const stats = [
    {
      icon: FiBriefcase,
      number: '50,000+',
      label: 'Active Jobs',
      description: 'Fresh opportunities posted daily',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiUsers,
      number: '1,000,000+',
      label: 'Job Seekers',
      description: 'Professionals trust our platform',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiHome,
      number: '10,000+',
      label: 'Companies',
      description: 'Top employers hiring actively',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: FiTrendingUp,
      number: '95%',
      label: 'Success Rate',
      description: 'Users find jobs within 3 months',
      color: 'from-orange-500 to-red-500'
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            Trusted by Millions Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the largest community of job seekers and employers. Our numbers speak for our commitment to connecting talent with opportunity.
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 text-center h-full">
                  <div className="space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="text-white text-2xl" />
                      </div>
                    </div>

                    {/* Number */}
                    <div className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900"
                      >
                        {stat.number}
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {stat.label}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Achievement Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  Industry Recognition
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform has been recognized by leading industry publications and has won numerous awards for innovation in recruitment technology.
                </p>
                
                {/* Awards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">2024</div>
                    <div className="text-sm text-gray-600">Best Job Platform</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                    <div className="text-sm text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">24/7</div>
                        <div className="text-xs text-blue-600">Support</div>
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-700">AI</div>
                        <div className="text-xs text-purple-600">Matching</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">Global</div>
                        <div className="text-xs text-green-600">Reach</div>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700">Fast</div>
                        <div className="text-xs text-orange-600">Hiring</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Statistics; 