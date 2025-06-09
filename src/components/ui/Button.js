import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white',
  secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white',
  outline: 'bg-transparent border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200',
  gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white',
};

const sizes = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-2.5 px-5 text-lg',
  xl: 'py-3 px-6 text-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon,
  onClick,
  as,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900';
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const disabledClasses = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`;

  // If an "as" prop is provided, render as that component (e.g., Link from react-router-dom)
  const Component = as || motion.button;

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );

  // If rendering as a button, add motion effects and button-specific props
  if (!as) {
    return (
      <motion.button
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={combinedClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  // Otherwise, render as the specified component with appropriate props
  return (
    <Component
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {content}
    </Component>
  );
};

export default Button;
