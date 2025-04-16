import React, { ReactNode } from 'react';

export interface SummaryItem {
  label: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
}

export interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  onEdit?: () => void;
  editText?: string;
  className?: string;
  highlightChanges?: boolean;
  changedFields?: string[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  items,
  onEdit,
  editText = 'Edit',
  className = '',
  highlightChanges = false,
  changedFields = [],
}) => {
  return (
    <div className={`bg-white shadow overflow-hidden rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg 
              className="h-4 w-4 mr-1 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 6.732a2.5 2.5 0 010-3.536z"
              />
            </svg>
            {editText}
          </button>
        )}
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          {items.map((item, index) => {
            const isHighlighted = highlightChanges && changedFields?.includes(item.label);
            return (
              <div 
                key={index} 
                className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } ${
                  isHighlighted ? 'bg-yellow-50' : ''
                }`}
              >
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {item.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

export default SummaryCard;