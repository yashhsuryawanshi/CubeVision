import { useState, useRef, useCallback, useEffect } from 'react';
import { Crop, X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropper({ imageUrl, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 100, y: 100, width: 200, height: 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Initialize crop area when image loads
  useEffect(() => {
    if (imageLoaded && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const size = Math.min(containerRect.width * 0.6, containerRect.height * 0.6, 250);
      const x = (containerRect.width - size) / 2;
      const y = (containerRect.height - size) / 2;
      setCropArea({ x, y, width: size, height: size });
    }
  }, [imageLoaded]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || '');
      return;
    }
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y
      });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isResizing && resizeHandle) {
      const minSize = 50;
      const maxSize = Math.min(rect.width * 0.8, rect.height * 0.8);
      
      let newArea = { ...cropArea };
      
      if (resizeHandle.includes('right')) {
        newArea.width = Math.max(minSize, Math.min(maxSize, e.clientX - rect.left - cropArea.x));
      }
      if (resizeHandle.includes('bottom')) {
        newArea.height = Math.max(minSize, Math.min(maxSize, e.clientY - rect.top - cropArea.y));
      }
      if (resizeHandle.includes('left')) {
        const newWidth = Math.max(minSize, cropArea.width - (e.clientX - rect.left - cropArea.x));
        const deltaX = cropArea.width - newWidth;
        newArea.x = Math.max(0, cropArea.x + deltaX);
        newArea.width = newWidth;
      }
      if (resizeHandle.includes('top')) {
        const newHeight = Math.max(minSize, cropArea.height - (e.clientY - rect.top - cropArea.y));
        const deltaY = cropArea.height - newHeight;
        newArea.y = Math.max(0, cropArea.y + deltaY);
        newArea.height = newHeight;
      }

      // Keep crop area within bounds
      newArea.x = Math.max(0, Math.min(newArea.x, rect.width - newArea.width));
      newArea.y = Math.max(0, Math.min(newArea.y, rect.height - newArea.height));
      
      setCropArea(newArea);
    } else if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, cropArea]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  const handleCrop = useCallback(() => {
    const image = imageRef.current;
    const container = containerRef.current;
    
    if (!image || !container || !imageLoaded) return;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) return;

    // Set cropped canvas size to a standard size for better quality
    const outputSize = 400;
    croppedCanvas.width = outputSize;
    croppedCanvas.height = outputSize;

    const containerRect = container.getBoundingClientRect();
    
    // Calculate the scale factor between displayed image and natural image
    const displayWidth = containerRect.width;
    const displayHeight = containerRect.height;
    
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const containerAspect = displayWidth / displayHeight;
    
    let imageDisplayWidth, imageDisplayHeight, imageOffsetX = 0, imageOffsetY = 0;
    
    // Calculate how the image is actually displayed (object-contain behavior)
    if (imageAspect > containerAspect) {
      // Image is wider than container aspect ratio
      imageDisplayWidth = displayWidth;
      imageDisplayHeight = displayWidth / imageAspect;
      imageOffsetY = (displayHeight - imageDisplayHeight) / 2;
    } else {
      // Image is taller than container aspect ratio
      imageDisplayHeight = displayHeight;
      imageDisplayWidth = displayHeight * imageAspect;
      imageOffsetX = (displayWidth - imageDisplayWidth) / 2;
    }

    // Calculate the crop area in terms of the natural image coordinates
    const scaleX = image.naturalWidth / imageDisplayWidth;
    const scaleY = image.naturalHeight / imageDisplayHeight;
    
    const cropX = Math.max(0, (cropArea.x - imageOffsetX) * scaleX);
    const cropY = Math.max(0, (cropArea.y - imageOffsetY) * scaleY);
    const cropWidth = Math.min(image.naturalWidth - cropX, cropArea.width * scaleX);
    const cropHeight = Math.min(image.naturalHeight - cropY, cropArea.height * scaleY);

    // Draw the cropped portion
    croppedCtx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert to data URL
    const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  }, [cropArea, onCrop, imageLoaded]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crop className="w-6 h-6 text-orchid" />
            <h2 className="text-2xl font-bold text-white">Crop Image</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-white-10 hover:bg-white-20 transition-smooth"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white-80 text-center">
            Drag the crop area to select the cube face you want to analyze
          </p>
        </div>

        <div className="relative flex justify-center mb-6">
          <div 
            ref={containerRef}
            className="relative w-full max-w-2xl h-96 border border-white-20 rounded-xl bg-white-5 overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'grab' }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute inset-0 w-full h-full object-contain"
              onLoad={() => {
                setImageLoaded(true);
              }}
            />
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
            
            {/* Crop area */}
            {imageLoaded && (
              <div
                className="absolute border-2 border-orchid bg-transparent pointer-events-none"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  backgroundColor: 'transparent'
                }}
              >
                {/* Resize handles */}
                <div 
                  className="absolute -top-1 -left-1 w-3 h-3 bg-orchid rounded-full cursor-nw-resize resize-handle pointer-events-auto"
                  data-handle="top-left"
                ></div>
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-orchid rounded-full cursor-ne-resize resize-handle pointer-events-auto"
                  data-handle="top-right"
                ></div>
                <div 
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-orchid rounded-full cursor-sw-resize resize-handle pointer-events-auto"
                  data-handle="bottom-left"
                ></div>
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-orchid rounded-full cursor-se-resize resize-handle pointer-events-auto"
                  data-handle="bottom-right"
                ></div>
                
                {/* Edge handles */}
                <div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-orchid rounded-full cursor-n-resize resize-handle pointer-events-auto"
                  data-handle="top"
                ></div>
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-orchid rounded-full cursor-s-resize resize-handle pointer-events-auto"
                  data-handle="bottom"
                ></div>
                <div 
                  className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-orchid rounded-full cursor-w-resize resize-handle pointer-events-auto"
                  data-handle="left"
                ></div>
                <div 
                  className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-orchid rounded-full cursor-e-resize resize-handle pointer-events-auto"
                  data-handle="right"
                ></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="btn-outline px-6 py-3 flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={handleCrop}
            className="btn-primary px-6 py-3 flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Crop & Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
}