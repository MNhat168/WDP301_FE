import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiUsers, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FeaturedJobs = () => {
  // Mock data - in real app, this would come from an API
  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: '/api/placeholder/60/60',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $150k',
      posted: '2 days ago',
      featured: true,
      urgent: false,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      description: 'Join our team to build next-generation web applications...',
      applicants: 45
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'InnovateLab',
      logo: '/api/placeholder/60/60',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100k - $130k',
      posted: '1 day ago',
      featured: true,
      urgent: true,
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      description: 'Lead product development for our cutting-edge platform...',
      applicants: 32
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      logo: '/api/placeholder/60/60',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$90k - $120k',
      posted: '3 days ago',
      featured: true,
      urgent: false,
      skills: ['Figma', 'User Research', 'Prototyping'],
      description: 'Create beautiful and intuitive user experiences...',
      applicants: 28
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudTech',
      logo: '/api/placeholder/60/60',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$110k - $140k',
      posted: '1 day ago',
      featured: true,
      urgent: false,
      skills: ['AWS', 'Docker', 'Kubernetes'],
      description: 'Build and maintain our cloud infrastructure...',
      applicants: 19
    },
    {
      id: 5,
      title: 'Data Scientist',
      company: 'DataInsights',
      logo: '/api/placeholder/60/60',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$125k - $160k',
      posted: '2 days ago',
      featured: true,
      urgent: true,
      skills: ['Python', 'Machine Learning', 'SQL'],
      description: 'Analyze complex datasets to drive business decisions...',
      applicants: 67
    },
    {
      id: 6,
      title: 'Marketing Manager',
      company: 'GrowthCo',
      logo: '/api/placeholder/60/60',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$80k - $100k',
      posted: '4 days ago',
      featured: true,
      urgent: false,
      skills: ['Digital Marketing', 'SEO', 'Analytics'],
      description: 'Drive our marketing strategy and brand growth...',
      applicants: 41
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
    <section className="py-20 bg-gray-50">
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
            Featured Job Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hand-picked positions from top companies actively looking for talented professionals like you.
          </p>
        </motion.div>

        {/* Jobs Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {featuredJobs.map((job) => (
            <motion.div
              key={job.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                {/* Header with badges */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    {job.featured && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                    {job.urgent && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Company info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <FiBriefcase className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{job.company}</p>
                  </div>
                </div>

                {/* Job details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiMapPin className="mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiClock className="mr-2 text-gray-400" />
                    {job.type} • {job.posted}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiDollarSign className="mr-2 text-gray-400" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiUsers className="mr-2 text-gray-400" />
                    {job.applicants} applicants
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {job.description}
                </p>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    to={`/job/${job.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Apply Now
                  </Link>
                  <button className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
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

export default FeaturedJobs; 