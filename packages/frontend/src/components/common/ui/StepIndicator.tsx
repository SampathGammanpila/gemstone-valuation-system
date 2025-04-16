import React from 'react';

export interface Step {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  failedSteps?: number[];
  onChange?: (stepIndex: number) => void;
  allowNavigation?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  failedSteps = [],
  onChange,
  allowNavigation = false,
  orientation = 'horizontal',
  className = '',
}) => {
  const isStepCompleted = (index: number) => completedSteps.includes(index);
  const isStepFailed = (index: number) => failedSteps.includes(index);
  const isStepCurrent = (index: number) => currentStep === index;
  
  const handleStepClick = (index: number) => {
    if (!allowNavigation) return;
    if (onChange) onChange(index);
  };
  
  const getStepIcon = (index: number) => {
    if (isStepCompleted(index)) {
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    if (isStepFailed(index)) {
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    
    return <span className="text-white font-medium">{index + 1}</span>;
  };
  
  const getStepClasses = (index: number) => {
    let stepClass = '';
    
    if (isStepCompleted(index)) {
      stepClass = 'bg-green-600';
    } else if (isStepFailed(index)) {
      stepClass = 'bg-red-600';
    } else if (isStepCurrent(index)) {
      stepClass = 'bg-primary-600';
    } else {
      stepClass = 'bg-gray-300';
    }
    
    return stepClass;
  };
  
  if (orientation === 'vertical') {
    return (
      <div className={`${className}`}>
        <ol className="relative border-l border-gray-200 ml-3">
          {steps.map((step, index) => (
            <li key={step.id} className="mb-10 ml-6">
              <div 
                className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ${getStepClasses(index)} ${allowNavigation ? 'cursor-pointer' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                {getStepIcon(index)}
              </div>
              <div 
                className={`${isStepCurrent(index) ? 'font-bold' : 'font-medium'} ${allowNavigation ? 'cursor-pointer' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <h3 className="text-lg">{step.title}</h3>
                {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`
              flex items-center 
              ${index !== steps.length - 1 ? 'w-full' : ''}
            `}
          >
            <div 
              className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${getStepClasses(index)}
                ${allowNavigation ? 'cursor-pointer' : ''}
              `}
              onClick={() => handleStepClick(index)}
            >
              {getStepIcon(index)}
            </div>
            
            <div 
              className={`
                flex-col ml-2 ${index !== steps.length - 1 ? 'hidden sm:flex' : 'flex'}
                ${allowNavigation ? 'cursor-pointer' : ''}
              `}
              onClick={() => handleStepClick(index)}
            >
              <span className={`text-sm ${isStepCurrent(index) ? 'font-bold' : 'font-medium'}`}>
                {step.title}
              </span>
              {step.description && (
                <span className="text-xs text-gray-500">
                  {step.description}
                </span>
              )}
            </div>
            
            {index !== steps.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default StepIndicator;