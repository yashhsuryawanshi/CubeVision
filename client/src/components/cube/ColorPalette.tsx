import { useState } from "react";
import { Palette, RotateCcw, Check } from "lucide-react";
import FaceGrid from "./FaceGrid";

interface ColorPaletteProps {
  selectedFace: string;
  colors: string[];
  onColorChange: (squareIndex: number, color: string) => void;
}

const CUBE_COLORS = [
  { name: 'White', value: 'white', class: 'bg-white border-2 border-gray-300' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-400' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
];

export default function ColorPalette({ selectedFace, colors, onColorChange }: ColorPaletteProps) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('white');

  const handleSquareClick = (squareIndex: number) => {
    if (selectedSquare === squareIndex) {
      // If clicking the same square, deselect it
      setSelectedSquare(null);
    } else {
      // Select the new square
      setSelectedSquare(squareIndex);
      setSelectedColor(colors[squareIndex] || 'white');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (selectedSquare !== null) {
      onColorChange(selectedSquare, color);
      // Auto-deselect square after applying color
      setSelectedSquare(null);
    }
  };

  const applyColorToSquare = () => {
    if (selectedSquare !== null) {
      onColorChange(selectedSquare, selectedColor);
    }
  };

  const resetFace = () => {
    const defaultColor = 'white'; // Or determine based on face
    for (let i = 0; i < 9; i++) {
      onColorChange(i, defaultColor);
    }
    setSelectedSquare(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 animate-fade-in">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-orchid" />
          <h3 className="text-2xl font-bold text-white">Color Correction</h3>
        </div>
        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-orchid/10 rounded-2xl border border-orchid/30">
            <p className="text-sm text-white-80">
              1. Click a square to select it<br />
              2. Choose the correct color<br />
              3. The color will apply automatically
            </p>
          </div>

          {/* Face Grid */}
          <div>
            <h4 className="font-semibold mb-4 text-white">
              Click a square to edit:
            </h4>
            <div className="flex justify-center">
              <FaceGrid
                colors={colors}
                onColorClick={handleSquareClick}
                selectedSquare={selectedSquare}
              />
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h4 className="font-semibold mb-4 text-white">
              Select Color:
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {CUBE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`p-4 rounded-2xl border-2 transition-smooth glass-panel-subtle animate-on-hover relative overflow-hidden ${
                    selectedColor === color.value
                      ? 'border-orchid scale-105 shadow-glow'
                      : 'border-white-20 hover:border-orchid hover:scale-105'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 ${color.class} rounded-xl border-2 border-white-40 shadow-glass relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {color.name}
                    </span>
                    {selectedColor === color.value && (
                      <Check className="w-4 h-4 text-orchid" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={resetFace}
              className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2 animate-on-hover"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Face</span>
            </button>
          </div>

          {/* Selected Square Info */}
          {selectedSquare !== null && (
            <div className="p-4 bg-orchid/10 rounded-2xl border border-orchid/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">
                  Selected: Square {selectedSquare + 1}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white-80">Current:</span>
                  <div className={`w-6 h-6 rounded-xl border-2 border-white-40 shadow-glass relative overflow-hidden ${
                    colors[selectedSquare] === 'white' ? 'bg-white' :
                    colors[selectedSquare] === 'yellow' ? 'bg-yellow-400' :
                    colors[selectedSquare] === 'red' ? 'bg-red-500' :
                    colors[selectedSquare] === 'orange' ? 'bg-orange-500' :
                    colors[selectedSquare] === 'green' ? 'bg-green-500' :
                    colors[selectedSquare] === 'blue' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color Distribution */}
      <div className="glass-panel p-6 animate-slide-in">
        <h3 className="text-xl font-bold text-white mb-4">Face Color Count</h3>
        <div className="space-y-3">
          {CUBE_COLORS.map((color) => {
            const count = colors.filter(c => c === color.value).length;
            return (
              <div key={color.value} className="flex items-center justify-between p-3 bg-white-5 rounded-xl border border-white-10">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 ${color.class} rounded-xl border-2 border-white-40 shadow-glass relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <span className="text-sm font-medium text-white">{color.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-white-80">{count}/9</span>
                  <div className="w-20 h-2 bg-white-10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.class.replace('border-2 border-gray-300', '')} transition-smooth`}
                      style={{ width: `${(count / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
