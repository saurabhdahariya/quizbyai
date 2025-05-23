import React from 'react';
import { motion } from 'framer-motion';

const Switch = ({ 
  checked, 
  onChange, 
  label, 
  description,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
          {...props}
        >
          <span className="sr-only">{label}</span>
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg`}
            style={{ 
              translateX: checked ? '1.25rem' : '0.25rem',
            }}
          />
        </button>
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Switch;
