import { useState } from "react";
import { Check, X, RotateCw, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import FaceGrid from "./FaceGrid";

interface ColorEditorProps {
  faceId: string;
  faceName: string;
  originalImage: string;
  detectedColors: string[];
  onSave: (colors: string[]) => void;
  onCancel: () => void;
}

const COLORS = [
  { name: 'white', color: '#ffffff', bg: 'bg-white', border: 'border-gray-300' },
  { name: 'yellow', color: '#ffd700', bg: 'bg-yellow-400', border: 'border-yellow-500' },
  { name: 'red', color: '#dc2626', bg: 'bg-red-500', border: 'border-red-600' },
  { name: 'orange', color: '#ea580c', bg: 'bg-orange-500', border: 'border-orange-600' },
  { name: 'green', color: '#16a34a', bg: 'bg-green-500', border: 'border-green-600' },
  { name: 'blue', color: '#2563eb', bg: 'bg-blue-500', border: 'border-blue-600' },
] as const;

export default function ColorEditor({ 
  faceId, 
  faceName, 
  originalImage, 
  detectedColors, 
  onSave, 
  onCancel 
}: ColorEditorProps) {
  const [colors, setColors] = useState<string[]>([...detectedColors]);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleColorSelect = (color: string) => {
    if (selectedSquare !== null) {
      const newColors = [...colors];
      newColors[selectedSquare] = color;
      setColors(newColors);
    }
  };

  const handleSquareClick = (index: number) => {
    setSelectedSquare(index);
  };

  const hasChanges = JSON.stringify(colors) !== JSON.stringify(detectedColors);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <div className="bg-app-gradient border border-white-20 rounded-2xl p-4 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">
            Edit <span className="text-coral">{faceName}</span> Face Colors
          </h2>
          <p className="text-white-80 text-sm">
            Click any square to change its color if AI detection is incorrect.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Original Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Original Image</h3>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="glass-panel p-1.5 hover:bg-white-20 transition-smooth"
              >
                {showOriginal ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
              </button>
            </div>
            
            {showOriginal && (
              <div className="aspect-square bg-white-10 rounded-xl overflow-hidden border border-white-20">
                <img
                  src={originalImage}
                  alt={`${faceName} face`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Status */}
            <div className="glass-panel p-3">
              <div className="flex items-center justify-center space-x-2">
                {hasChanges ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-coral" />
                    <span className="text-white text-sm font-medium">Modified</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-orchid" />
                    <span className="text-white text-sm font-medium">AI Detected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Color Editor */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Edit Colors</h3>
            <div className="glass-panel p-4">
              <FaceGrid
                colors={colors}
                onColorClick={handleSquareClick}
                selectedSquare={selectedSquare}
                size="md"
              />
              
              {selectedSquare !== null && (
                <div className="mt-3 p-2 bg-orchid/20 border border-orchid/30 rounded-lg">
                  <p className="text-xs text-white">
                    Selected: Square {selectedSquare + 1} ({colors[selectedSquare]})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Choose Color</h4>
            <div className="glass-panel p-3">
              <div className="grid grid-cols-2 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() => handleColorSelect(colorOption.name)}
                    disabled={selectedSquare === null}
                    className={`${colorOption.bg} ${colorOption.border} border-2 rounded-lg p-2 transition-smooth hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-1 min-h-[50px] justify-center`}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: colorOption.color }}></div>
                    <span className={`text-xs font-medium ${colorOption.name === 'white' ? 'text-gray-800' : 'text-white'}`}>
                      {colorOption.name}
                    </span>
                  </button>
                ))}
              </div>
              
              {selectedSquare === null && (
                <p className="text-xs text-white-60 text-center mt-2">
                  Click a square to edit
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white-20">
          <button
            onClick={onCancel}
            className="btn-outline px-4 py-2 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-3">
            {hasChanges && (
              <button
                onClick={() => setColors([...detectedColors])}
                className="glass-panel px-3 py-2 hover:bg-white-20 transition-smooth flex items-center space-x-1"
              >
                <RotateCw className="w-3 h-3 text-white" />
                <span className="text-white text-sm">Reset</span>
              </button>
            )}
            
            <button
              onClick={() => onSave(colors)}
              className="btn-primary px-5 py-2 flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}