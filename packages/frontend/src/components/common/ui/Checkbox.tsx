import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  options?: CheckboxOption[];
  label?: string;
  description?: string;
  helperText?: string;
  error?: string;
  checked?: boolean;
  disabled?: boolean;
  inline?: boolean;
  onChange?: (
    checked: boolean | string[], 
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    options, 
    label, 
    description,
    helperText, 
    error, 
    checked,
    disabled,
    inline = false, 
    className = '', 
    id,
    name,
    onChange,
    ...props 
  }, ref) => {
    // Generate a random ID if none provided
    const groupId = id || `checkbox-group-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle single checkbox
    if (!options) {
      const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          onChange(e.target.checked, e);
        }
      };
      
      return (
        <div className={`${className}`}>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={groupId}
                name={name}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className={`
                  w-4 h-4 
                  ${error ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500'}
                  rounded
                  border-gray-300
                  focus:ring-2
                  disabled:opacity-50
                `}
                onChange={handleSingleChange}
                ref={ref}
                {...props}
              />
            </div>
            <div className="ml-3 text-sm">
              {label && (
                <label 
                  htmlFor={groupId} 
                  className={`
                    font-medium 
                    ${disabled ? 'text-gray-400' : 'text-gray-700'}
                  `}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-gray-500">{description}</p>
              )}
            </div>
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
    
    // Handle multiple checkboxes
    const handleMultiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Find all checked checkboxes
        const checkboxes = document.querySelectorAll<HTMLInputElement>(`input[name="${name || groupId}"]`);
        const values: string[] = [];
        
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            values.push(checkbox.value);
          }
        });
        
        onChange(values, e);
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
            ${inline ? 'flex flex-wrap gap-6' : 'space-y-2'}
          `}
          role="group"
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
                    name={name || groupId}
                    type="checkbox"
                    value={String(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-4 h-4 
                      ${error ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500'}
                      rounded
                      border-gray-300
                      focus:ring-2
                      disabled:opacity-50
                    `}
                    onChange={handleMultiChange}
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;