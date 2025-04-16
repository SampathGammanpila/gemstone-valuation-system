import React, { ReactNode } from 'react';

export interface FormStepProps {
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted?: boolean;
  isFailed?: boolean;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  backButtonText?: string;
  hideBackButton?: boolean;
  disableNextButton?: boolean;
  className?: string;
}

const FormStep: React.FC<FormStepProps> = ({
  title,
  description,
  isActive,
  isCompleted = false,
  isFailed = false,
  children,
  onNext,
  onBack,
  nextButtonText = 'Continue',
  backButtonText = 'Back',
  hideBackButton = false,
  disableNextButton = false,
  className = '',
}) => {
  if (!isActive) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {description && <p className="mt-1 text-gray-600">{description}</p>}
        </div>
        
        <div className="space-y-6">
          {children}
        </div>
        
        <div className="mt-8 flex justify-between pt-5 border-t border-gray-200">
          <div>
            {!hideBackButton && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {backButtonText}
              </button>
            )}
          </div>
          
          <div>
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={disableNextButton}
                className={`
                  ml-3 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  ${disableNextButton 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700'
                  }
                `}
              >
                {nextButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep;