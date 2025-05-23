import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ 
  className = '', 
  options = [], 
  label,
  error,
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-4 py-2.5 rounded-lg border appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all duration-200';
  const errorClasses = error 
    ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20' 
    : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500/20';

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.select
          whileFocus={{ scale: 1.01 }}
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
