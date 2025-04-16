import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface RadioOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  options: RadioOption[];
  label?: string;
  helperText?: string;
  error?: string;
  inline?: boolean;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    options, 
    label, 
    helperText, 
    error, 
    inline = false, 
    className = '', 
    id,
    name,
    onChange,
    ...props 
  }, ref) => {
    // Generate a random ID if none provided
    const groupId = id || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    const groupName = name || groupId;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value, e);
      }
    };
    
    return (
      <div className={`${className}`}>
        {label && (
          <div className="text-sm font-medium text-gray-700 mb-1">
            {label}
          </div>
        )}
        
        <div 
          className={`
            ${inline ? 'flex items-center space-x-6' : 'space-y-2'}
          `} 
          role="radiogroup" 
          aria-labelledby={label ? groupId : undefined}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-${index}`;
            
            return (
              <div 
                key={optionId} 
                className={`
                  ${inline ? 'flex items-center' : 'flex items-start'}
                `}
              >
                <div className="flex items-center h-5">
                  <input
                    id={optionId}
                    name={groupName}
                    type="radio"
                    value={String(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-4 h-4 
                      ${error ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500'}
                      border-gray-300
                      focus:ring-2
                      disabled:opacity-50
                    `}
                    onChange={handleChange}
                    ref={index === 0 ? ref : undefined}
                    {...props}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label 
                    htmlFor={optionId} 
                    className={`
                      font-medium 
                      ${option.disabled ? 'text-gray-400' : 'text-gray-700'}
                    `}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-gray-500">{option.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {error ? (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio;