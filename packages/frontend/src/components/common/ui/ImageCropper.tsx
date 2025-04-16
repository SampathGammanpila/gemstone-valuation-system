import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from './Button';
import { FiCrop, FiRotateCw, FiX } from 'react-icons/fi';

interface ImageCropperProps {
  /**
   * The source image URL or data URL
   */
  src: string;
  
  /**
   * Callback function when cropping is completed
   */
  onCropComplete: (croppedImageBlob: Blob) => void;
  
  /**
   * Callback function when cropping is canceled
   */
  onCancel: () => void;
  
  /**
   * Aspect ratio of the crop (width / height)
   */
  aspect?: number;
  
  /**
   * Minimum crop width in pixels
   */
  minWidth?: number;
  
  /**
   * Minimum crop height in pixels
   */
  minHeight?: number;
  
  /**
   * Whether to show rotation controls
   */
  enableRotation?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * A component that allows users to crop and optionally rotate images
 */
const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  aspect,
  minWidth = 50,
  minHeight = 50,
  enableRotation = true,
  className = '',
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Set initial crop when image loads
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect || width / height,
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
    },
    [aspect]
  );
  
  // Rotate the image
  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };
  
  // Generate the cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No 2d context');
      }
      
      // Set canvas dimensions
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      // Account for rotation
      let canvasWidth = completedCrop.width * scaleX;
      let canvasHeight = completedCrop.height * scaleY;
      
      if (rotation === 90 || rotation === 270) {
        // Swap dimensions when rotated by 90 or 270 degrees
        [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Clear the canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation and crop
      ctx.save();
      
      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Rotate around the center
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Draw the image, offset by half its dimensions
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;
      
      // Adjust drawing based on rotation
      let drawX = -canvas.width / 2;
      let drawY = -canvas.height / 2;
      
      if (rotation === 90) {
        drawX = -canvas.width / 2 - cropX;
        drawY = -canvas.height / 2 + (image.naturalHeight - cropY - cropHeight);
      } else if (rotation === 180) {
        drawX = -canvas.width / 2 - (image.naturalWidth - cropX - cropWidth);
        drawY = -canvas.height / 2 - (image.naturalHeight - cropY - cropHeight);
      } else if (rotation === 270) {
        drawX = -canvas.width / 2 + (image.naturalWidth - cropX - cropWidth);
        drawY = -canvas.height / 2 - cropY;
      } else {
        drawX = -canvas.width / 2 - cropX;
        drawY = -canvas.height / 2 - cropY;
      }
      
      ctx.drawImage(
        image,
        0, 0,
        image.naturalWidth, image.naturalHeight,
        drawX, drawY,
        image.naturalWidth, image.naturalHeight
      );
      
      ctx.restore();
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating cropped image:', error);
      setIsProcessing(false);
    }
  }, [completedCrop, onCropComplete, rotation]);
  
  // Process crop when user clicks save
  const handleCropComplete = () => {
    generateCroppedImage();
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Crop Image</h3>
        <p className="text-sm text-gray-500">
          Drag to adjust the crop area. {aspect ? `Aspect ratio is locked to ${aspect}:1.` : 'Aspect ratio is free.'}
        </p>
      </div>
      
      <div className="max-h-[500px] overflow-auto mb-4">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          minWidth={minWidth}
          minHeight={minHeight}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            style={{ transform: `rotate(${rotation}deg)`, maxWidth: '100%' }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
      
      {/* Hidden canvas for generating the cropped image */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex items-center justify-between">
        <div>
          {enableRotation && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRotate}
              disabled={isProcessing}
              className="mr-2"
              icon={<FiRotateCw />}
            >
              Rotate
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            icon={<FiX />}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            isLoading={isProcessing}
            icon={<FiCrop />}
          >
            Crop & Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;