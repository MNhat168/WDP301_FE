import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiStar, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CTASection = () => {
  const benefits = [
    {
      icon: FiZap,
      title: 'Instant Matching',
      description: 'Get matched with relevant jobs instantly using our AI-powered algorithm'
    },
    {
      icon: FiStar,
      title: 'Premium Support',
      description: 'Access to career counselors and premium features to boost your profile'
    },
    {
      icon: FiTrendingUp,
      title: 'Career Growth',
      description: 'Track your career progress and get insights to advance faster'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Ready to Find Your
                <span className="block text-yellow-300">Dream Job?</span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join over 1 million professionals who have already found their perfect career match. 
                Start your journey today and unlock unlimited opportunities.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Get Started Free
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/loginemployeer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                Post a Job
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8/5</div>
                <div className="text-xs text-blue-200">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-blue-200">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-xs text-blue-200">No Hidden Fees</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto">
                    <FiStar className="text-yellow-800 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Join Today</h3>
                  <p className="text-blue-100">Start your career journey</p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Access to 50,000+ jobs</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">AI-powered job matching</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Professional CV builder</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Career guidance & support</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-4 px-6 rounded-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Sign Up Now - It's Free!
                </button>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -left-4 bg-yellow-400 rounded-xl p-3 shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-yellow-800 font-bold text-sm">New Jobs</div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -right-4 bg-green-400 rounded-xl p-3 shadow-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <div className="text-green-800 font-bold text-sm">Success Stories</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20 pt-12 border-t border-white/20"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
              Still have questions?
            </h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Our team is here to help you succeed. Get in touch and we'll guide you through your career journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Contact Support
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection; 