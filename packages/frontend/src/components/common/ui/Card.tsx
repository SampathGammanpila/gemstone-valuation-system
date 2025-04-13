import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  footerClassName?: string;
  bordered?: boolean;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  bordered = false,
  hoverable = false,
}) => {
  const cardClasses = `
    bg-white rounded-xl shadow-gemstone overflow-hidden
    ${bordered ? 'border border-gray-200' : ''}
    ${hoverable ? 'transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg' : ''}
    ${className}
  `;

  const headerExists = title || subtitle;

  return (
    <div className={cardClasses}>
      {headerExists && (
        <div className="px-6 pt-6 pb-3">
          {title && (
            <h3 className={`text-xl font-semibold text-gray-800 ${titleClassName}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`mt-1 text-sm text-gray-500 ${subtitleClassName}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={`px-6 py-4 ${headerExists ? '' : 'pt-6'} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;