import React from 'react';
import { PortfolioItem } from '../../../../types/user.types';

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  onDelete: (id: number) => void;
  isVerified: boolean;
  readOnly?: boolean;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ items, onDelete, isVerified, readOnly = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
        >
          <div className="relative">
            {/* Main image */}
            <img 
              src={item.image_urls[0]} 
              alt={item.title}
              className="w-full h-56 object-cover"
            />
            
            {/* Verification badge if portfolio is verified */}
            {isVerified && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Verified
              </div>
            )}
            
            {/* Delete button - only show if not in read-only mode */}
            {!readOnly && (
              <button
                onClick={() => onDelete(item.id!)}
                className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                aria-label="Delete item"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
            
            <div className="flex gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {item.gemstone_type}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {item.cut_type}
              </span>
            </div>
            
            {item.description && (
              <p className="text-gray-600 text-sm">{item.description}</p>
            )}
            
            {/* Multiple images indicator */}
            {item.image_urls.length > 1 && (
              <div className="mt-3 flex gap-1">
                {item.image_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="w-8 h-8 rounded overflow-hidden">
                    <img 
                      src={url} 
                      alt={`${item.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {item.image_urls.length > 4 && (
                  <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                    +{item.image_urls.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioGallery;