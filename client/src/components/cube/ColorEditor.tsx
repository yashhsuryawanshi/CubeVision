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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-app-gradient border border-white-20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Edit <span className="text-coral">{faceName}</span> Face Colors
          </h2>
          <p className="text-white-80">
            The AI detected these colors. Click any square to change its color if needed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Original Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Original Image</h3>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="glass-panel p-2 hover:bg-white-20 transition-smooth"
              >
                {showOriginal ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
              </button>
            </div>
            
            {showOriginal && (
              <div className="aspect-square bg-white-10 rounded-2xl overflow-hidden border border-white-20">
                <img
                  src={originalImage}
                  alt={`${faceName} face`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Status */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-center space-x-2">
                {hasChanges ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-coral" />
                    <span className="text-white font-medium">Colors modified</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-orchid" />
                    <span className="text-white font-medium">AI detection accepted</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Color Editor */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Edit Colors</h3>
              <div className="glass-panel p-6">
                <FaceGrid
                  colors={colors}
                  onColorClick={handleSquareClick}
                  selectedSquare={selectedSquare}
                  size="lg"
                />
                
                {selectedSquare !== null && (
                  <div className="mt-4 p-3 bg-orchid/20 border border-orchid/30 rounded-lg">
                    <p className="text-sm text-white mb-2">
                      Selected: Square {selectedSquare + 1} (currently {colors[selectedSquare]})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Choose Color</h4>
              <div className="glass-panel p-4">
                <div className="grid grid-cols-3 gap-3">
                  {COLORS.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => handleColorSelect(colorOption.name)}
                      disabled={selectedSquare === null}
                      className={`${colorOption.bg} ${colorOption.border} border-2 rounded-lg p-3 transition-smooth hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-1 min-h-[60px] justify-center`}
                    >
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colorOption.color }}></div>
                      <span className={`text-xs font-medium ${colorOption.name === 'white' ? 'text-gray-800' : 'text-white'}`}>
                        {colorOption.name}
                      </span>
                    </button>
                  ))}
                </div>
                
                {selectedSquare === null && (
                  <p className="text-sm text-white-60 text-center mt-3">
                    Click a square above to select it for editing
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white-20">
          <button
            onClick={onCancel}
            className="btn-outline px-6 py-3 flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-4">
            {hasChanges && (
              <button
                onClick={() => setColors([...detectedColors])}
                className="glass-panel px-4 py-2 hover:bg-white-20 transition-smooth flex items-center space-x-2"
              >
                <RotateCw className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Reset</span>
              </button>
            )}
            
            <button
              onClick={() => onSave(colors)}
              className="btn-primary px-6 py-3 flex items-center space-x-2 animate-pulse-glow"
            >
              <Check className="w-5 h-5" />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}