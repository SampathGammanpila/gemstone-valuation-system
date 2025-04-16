import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    fullWidth = false, 
    startIcon, 
    endIcon, 
    className = '', 
    id,
    ...props 
  }, ref) => {
    // Generate a random ID if none provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              px-3 py-2 
              ${startIcon ? 'pl-10' : ''} 
              ${endIcon ? 'pr-10' : ''}
              border border-gray-300 
              rounded-md 
              shadow-sm 
              focus:outline-none 
              focus:ring-2 
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'focus:border-primary-500 focus:ring-primary-500'
              }
              disabled:bg-gray-100 
              disabled:text-gray-500 
              disabled:cursor-not-allowed
              ${fullWidth ? 'w-full' : ''}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        
        {error ? (
          <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500" id={`${inputId}-helper`}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;