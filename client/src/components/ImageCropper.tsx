import { useState, useRef, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y
      });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) return;

    // Set cropped canvas size
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;

    // Calculate scale factors
    const scaleX = image.naturalWidth / canvas.width;
    const scaleY = image.naturalHeight / canvas.height;

    // Draw the cropped portion
    croppedCtx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to data URL
    const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  }, [cropArea, onCrop]);

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
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="border border-white-20 rounded-xl bg-white-5"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute inset-0 w-full h-full object-contain opacity-0"
              onLoad={() => {
                const canvas = canvasRef.current;
                const image = imageRef.current;
                if (canvas && image) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                  }
                }
              }}
            />
            
            {/* Crop overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50"></div>
              
              {/* Crop area */}
              <div
                className="absolute border-2 border-orchid bg-transparent"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Corner handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-orchid rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orchid rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orchid rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orchid rounded-full"></div>
              </div>
            </div>
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