import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Palette, RotateCcw } from "lucide-react";
import FaceGrid from "./FaceGrid";

interface ColorPaletteProps {
  selectedFace: string;
  colors: string[];
  onColorChange: (squareIndex: number, color: string) => void;
}

const CUBE_COLORS = [
  { name: 'White', value: 'white', class: 'bg-white border-2 border-gray-300', textClass: 'text-gray-800' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-400', textClass: 'text-gray-800' },
  { name: 'Red', value: 'red', class: 'bg-red-500', textClass: 'text-white' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500', textClass: 'text-white' },
  { name: 'Green', value: 'green', class: 'bg-green-500', textClass: 'text-white' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500', textClass: 'text-white' },
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Palette className="w-5 h-5" />
            <span>Color Correction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              1. Click a square to select it<br />
              2. Choose the correct color<br />
              3. Click "Apply Color" or select another square
            </p>
          </div>

          {/* Face Grid */}
          <div>
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
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
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
              Select Color:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {CUBE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-gray-800 dark:border-white scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${color.class}`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${color.class} rounded border`}></div>
                    <span className={`text-sm font-medium ${
                      selectedColor === color.value ? color.textClass : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {color.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={applyColorToSquare}
              disabled={selectedSquare === null}
              className="w-full"
            >
              Apply {CUBE_COLORS.find(c => c.value === selectedColor)?.name} Color
            </Button>
            
            <Button
              onClick={resetFace}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Face
            </Button>
          </div>

          {/* Selected Square Info */}
          {selectedSquare !== null && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: Square {selectedSquare + 1}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
                  <div className={`w-6 h-6 rounded border ${
                    colors[selectedSquare] === 'white' ? 'bg-white border-gray-300' :
                    colors[selectedSquare] === 'yellow' ? 'bg-yellow-400' :
                    colors[selectedSquare] === 'red' ? 'bg-red-500' :
                    colors[selectedSquare] === 'orange' ? 'bg-orange-500' :
                    colors[selectedSquare] === 'green' ? 'bg-green-500' :
                    colors[selectedSquare] === 'blue' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CUBE_COLORS.map((color) => {
              const count = colors.filter(c => c === color.value).length;
              return (
                <div key={color.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${color.class} rounded border`}></div>
                    <span className="text-sm">{color.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">{count}</span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color.class.replace('border-2 border-gray-300', '')} transition-all duration-300`}
                        style={{ width: `${(count / 9) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
