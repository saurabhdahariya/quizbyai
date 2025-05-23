import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  glass = false,
  hover = false,
  delay = 0,
  ...props 
}) => {
  const baseClasses = 'rounded-xl overflow-hidden';
  const glassClasses = glass 
    ? 'backdrop-blur-lg bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/20' 
    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={`${baseClasses} ${glassClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 border-b border-slate-200 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-bold text-slate-800 dark:text-slate-200 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`mt-1 text-sm text-slate-600 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 border-t border-slate-200 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
