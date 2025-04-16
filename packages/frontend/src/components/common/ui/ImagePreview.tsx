import React, { useState } from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize, FiX } from 'react-icons/fi';

interface ImagePreviewProps {
  /**
   * The source URL of the image
   */
  src: string;
  
  /**
   * Alt text for the image
   */
  alt?: string;
  
  /**
   * Whether to enable zoom controls
   */
  enableZoom?: boolean;
  
  /**
   * Whether to enable fullscreen view
   */
  enableFullscreen?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Callback when the image fails to load
   */
  onError?: () => void;
}

/**
 * A component that displays an image with optional zoom and fullscreen controls
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Image preview',
  enableZoom = true,
  enableFullscreen = true,
  className = '',
  onError,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Handle zoom in
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.5);
    }
  };
  
  // Handle zoom out
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.5);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(prev => !prev);
    // Reset zoom when toggling fullscreen
    setZoomLevel(1);
  };
  
  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    if (onError) {
      onError();
    }
  };
  
  // Render fullscreen preview
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
          aria-label="Close fullscreen view"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <div className="relative max-w-screen-xl max-h-screen overflow-auto p-4">
          <img
            src={src}
            alt={alt}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {enableZoom && imageLoaded && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <FiZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <FiZoomIn className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render normal preview
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <svg
              className="w-12 h-12 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <svg
            className="w-12 h-12 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        style={imageLoaded ? { transform: `scale(${zoomLevel})`, transformOrigin: 'center' } : { opacity: 0 }}
        className="w-full h-auto object-contain transition-all duration-200"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {imageLoaded && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {enableZoom && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-1 text-gray-700 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <FiZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1 text-gray-700 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <FiZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          
          {enableFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 text-gray-700 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100"
              aria-label="View fullscreen"
            >
              <FiMaximize className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;