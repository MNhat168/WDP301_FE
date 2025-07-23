import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiBriefcase, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CompanyShowcase = () => {
  // Mock data for featured companies
  const featuredCompanies = [
    {
      id: 1,
      name: 'TechCorp',
      industry: 'Technology',
      location: 'San Francisco, CA',
      employees: '1,000-5,000',
      openJobs: 45,
      logo: '/api/placeholder/80/80',
      description: 'Leading technology company specializing in AI and machine learning solutions.',
      featured: true
    },
    {
      id: 2,
      name: 'InnovateLab',
      industry: 'Software',
      location: 'Remote',
      employees: '100-500',
      openJobs: 23,
      logo: '/api/placeholder/80/80',
      description: 'Innovative software development company building next-generation applications.',
      featured: true
    },
    {
      id: 3,
      name: 'DesignStudio',
      industry: 'Design',
      location: 'New York, NY',
      employees: '50-200',
      openJobs: 12,
      logo: '/api/placeholder/80/80',
      description: 'Creative design agency working with top brands worldwide.',
      featured: true
    },
    {
      id: 4,
      name: 'DataInsights',
      industry: 'Analytics',
      location: 'Seattle, WA',
      employees: '200-1,000',
      openJobs: 18,
      logo: '/api/placeholder/80/80',
      description: 'Data analytics company helping businesses make informed decisions.',
      featured: true
    },
    {
      id: 5,
      name: 'CloudTech',
      industry: 'Cloud Services',
      location: 'Austin, TX',
      employees: '500-2,000',
      openJobs: 34,
      logo: '/api/placeholder/80/80',
      description: 'Cloud infrastructure provider serving enterprise clients globally.',
      featured: true
    },
    {
      id: 6,
      name: 'GrowthCo',
      industry: 'Marketing',
      location: 'Chicago, IL',
      employees: '100-500',
      openJobs: 16,
      logo: '/api/placeholder/80/80',
      description: 'Digital marketing agency driving growth for startups and enterprises.',
      featured: true
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
            Top Companies Hiring Now
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have found their dream careers at these industry-leading companies.
          </p>
        </motion.div>

        {/* Companies Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {featuredCompanies.map((company) => (
            <motion.div
              key={company.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
            >
              <Link to={`/company/${company.id}`} className="block">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Logo placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600">{company.industry}</p>
                      </div>
                    </div>
                    {company.featured && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiMapPin className="mr-2 text-gray-400" />
                      {company.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiUsers className="mr-2 text-gray-400" />
                      {company.employees} employees
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiBriefcase className="mr-2 text-gray-400" />
                      {company.openJobs} open positions
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                        View Jobs
                      </button>
                      <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors text-sm font-medium">
                        Follow
                      </button>
                    </div>
                    <FiArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Company Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Why Companies Choose Us
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We help companies of all sizes find the right talent quickly and efficiently. Our platform connects you with qualified candidates who match your requirements.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Access to 1M+ qualified professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">AI-powered candidate matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Streamlined hiring process</span>
                </div>
              </div>

              <Link
                to="/loginemployeer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                Post a Job
                <FiArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">Fast</div>
                      <div className="text-sm text-blue-600">Hiring</div>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">Quality</div>
                      <div className="text-xs text-purple-600">Candidates</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">AI</div>
                      <div className="text-xs text-green-600">Matching</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700">24/7</div>
                      <div className="text-sm text-orange-600">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/companies"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Explore All Companies
            <FiArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyShowcase; 