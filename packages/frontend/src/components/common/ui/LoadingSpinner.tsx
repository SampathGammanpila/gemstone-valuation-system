import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = '',
  text,
  fullScreen = false,
}) => {
  // Determine size classes
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3',
  };

  // Determine color classes
  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  // Spinner element
  const spinner = (
    <div 
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );

  // Full screen overlay if needed
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-2 text-white font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Regular spinner with optional text
  return (
    <div className="flex items-center justify-center">
      {spinner}
      {text && (
        <span className="ml-2 text-gray-700">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;