import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const FloatingFeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.3 }}
      >
        <motion.button
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare className="h-6 w-6" />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : 10
            }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 dark:bg-slate-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
          >
            Send Feedback
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800 dark:border-l-slate-700"></div>
          </motion.div>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-ping opacity-20"></div>
        </motion.button>
      </motion.div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default FloatingFeedbackButton;
