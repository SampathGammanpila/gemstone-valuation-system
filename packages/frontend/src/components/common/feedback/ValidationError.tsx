import React from 'react';

export interface ValidationErrorProps {
  message: string | string[];
  className?: string;
  fieldId?: string;
  icon?: boolean;
  role?: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({
  message,
  className = '',
  fieldId,
  icon = true,
  role = 'alert',
}) => {
  if (!message || (Array.isArray(message) && message.length === 0)) {
    return null;
  }

  const messages = Array.isArray(message) ? message : [message];

  return (
    <div 
      className={`mt-1 text-sm text-red-600 ${className}`} 
      id={fieldId ? `${fieldId}-error` : undefined}
      role={role}
    >
      {messages.map((msg, index) => (
        <div key={index} className="flex items-start">
          {icon && (
            <svg 
              className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
          <span>{msg}</span>
        </div>
      ))}
    </div>
  );
};

// This component can also render a list of validation errors
export interface ValidationErrorListProps {
  errors: Record<string, string | string[]>;
  className?: string;
}

export const ValidationErrorList: React.FC<ValidationErrorListProps> = ({
  errors,
  className = '',
}) => {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div 
      className={`rounded-md bg-red-50 p-4 mb-4 ${className}`}
      role="alert"
      aria-label="Form validation errors"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            There {errorEntries.length === 1 ? 'is' : 'are'} {errorEntries.length} {errorEntries.length === 1 ? 'error' : 'errors'} with your submission
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errorEntries.map(([field, error]) => {
                const messages = Array.isArray(error) ? error : [error];
                return messages.map((message, index) => (
                  <li key={`${field}-${index}`}>
                    <span className="font-medium">{field}:</span> {message}
                  </li>
                ));
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationError;