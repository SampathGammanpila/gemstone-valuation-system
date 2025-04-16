import React, { useState, useRef, ChangeEvent } from 'react';
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import ImagePreview from './ImagePreview';

export interface ImageUploadProps {
  /**
   * Function called when an image is selected
   */
  onImageSelect: (file: File) => void;
  
  /**
   * Function called when an image is removed
   */
  onImageRemove?: () => void;
  
  /**
   * Maximum file size in bytes (default: 5MB)
   */
  maxSize?: number;
  
  /**
   * Allowed file types (default: ['image/jpeg', 'image/png', 'image/webp'])
   */
  allowedTypes?: string[];
  
  /**
   * Current image URL for preview (if already uploaded)
   */
  currentImage?: string;
  
  /**
   * Whether multiple images can be selected
   */
  multiple?: boolean;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  currentImage,
  multiple = false,
  label = 'Upload Image',
  helperText = 'Drag and drop an image here, or click to select',
  error,
  disabled = false,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection via input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  // Validate and process the selected file
  const validateAndProcessFile = (file: File) => {
    setFileError(null);

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setFileError(`File type not supported. Please upload a ${allowedTypes.map(type => type.replace('image/', '')).join(', ')} file.`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      setFileError(`File size is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Call the callback function
    onImageSelect(file);
  };

  // Trigger file input click
  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove the image
  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewUrl && previewUrl !== currentImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileError(null);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const displayError = error || fileError;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${displayError ? 'border-red-500 bg-red-50' : ''}
          `}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-5">
            <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">{helperText}</p>
            {multiple && (
              <p className="text-xs text-gray-500 mt-1">You can upload multiple images</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            accept={allowedTypes.join(',')}
            multiple={multiple}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <ImagePreview src={previewUrl} alt="Preview" />
          
          {!disabled && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-100"
              aria-label="Remove image"
            >
              <FiTrash2 className="w-5 h-5 text-red-500" />
            </button>
          )}
        </div>
      )}
      
      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
      
      {!displayError && helperText && !previewUrl && (
        <p className="mt-1 text-xs text-gray-500">
          {`Supported formats: ${allowedTypes.map(type => type.replace('image/', '.')).join(', ')} up to ${maxSize / (1024 * 1024)}MB`}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;