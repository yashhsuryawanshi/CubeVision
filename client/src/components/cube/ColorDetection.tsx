import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import { detectColorsFromImage } from "../../lib/roboflow";
import FaceGrid from "./FaceGrid";
import ColorPalette from "./ColorPalette";

interface ColorDetectionProps {
  onNext: () => void;
  onBack: () => void;
}

const CUBE_FACES = [
  { id: 'front', name: 'Front', color: 'bg-red-500' },
  { id: 'back', name: 'Back', color: 'bg-orange-500' },
  { id: 'left', name: 'Left', color: 'bg-green-500' },
  { id: 'right', name: 'Right', color: 'bg-blue-500' },
  { id: 'top', name: 'Top', color: 'bg-white border' },
  { id: 'bottom', name: 'Bottom', color: 'bg-yellow-400' },
] as const;

export default function ColorDetection({ onNext, onBack }: ColorDetectionProps) {
  const { faceImages, faceColors, setFaceColors, cubeState } = useCube();
  const [processing, setProcessing] = useState(false);
  const [processedFaces, setProcessedFaces] = useState<Set<string>>(new Set());
  const [selectedFace, setSelectedFace] = useState('front');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    processAllImages();
  }, []);

  const processAllImages = async () => {
    setProcessing(true);
    setErrors({});
    
    const faceIds = Object.keys(faceImages);
    for (const faceId of faceIds) {
      try {
        const imageData = faceImages[faceId as keyof typeof faceImages];
        if (imageData) {
          const detectedColors = await detectColorsFromImage(imageData);
          setFaceColors(faceId as any, detectedColors);
          setProcessedFaces(prev => new Set([...prev, faceId]));
        }
      } catch (error) {
        console.error(`Error processing ${faceId} face:`, error);
        setErrors(prev => ({ ...prev, [faceId]: 'Color detection failed. Please adjust manually.' }));
        // Set default colors as fallback
        setFaceColors(faceId as any, Array(9).fill('white'));
        setProcessedFaces(prev => new Set([...prev, faceId]));
      }
    }
    
    setProcessing(false);
  };

  const handleColorChange = (faceId: string, squareIndex: number, color: string) => {
    const currentColors = faceColors[faceId as keyof typeof faceColors] || Array(9).fill('white');
    const newColors = [...currentColors];
    newColors[squareIndex] = color;
    setFaceColors(faceId as any, newColors);
    
    // Clear any error for this face
    if (errors[faceId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[faceId];
        return newErrors;
      });
    }
  };

  const validateCube = () => {
    // Basic validation: each color should appear exactly 9 times
    const colorCounts: Record<string, number> = {};
    
    Object.values(faceColors).forEach(colors => {
      colors.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    });

    const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
    for (const color of validColors) {
      if (colorCounts[color] !== 9) {
        return false;
      }
    }

    return true;
  };

  const progress = (processedFaces.size / Object.keys(faceImages).length) * 100;
  const allProcessed = processedFaces.size === Object.keys(faceImages).length && !processing;
  const isValid = validateCube();

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Color Detection & Correction
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            AI-detected colors are shown below. Click any square to manually correct colors.
          </p>
          
          {processing && (
            <div className="max-w-md mx-auto mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Processing images with AI... {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          {allProcessed && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              {isValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Cube state is valid!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Please check color distribution</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Face Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CUBE_FACES.map((face) => (
            <Button
              key={face.id}
              onClick={() => setSelectedFace(face.id)}
              variant={selectedFace === face.id ? "default" : "outline"}
              size="sm"
              className="relative"
            >
              <div className={`w-3 h-3 ${face.color} rounded-sm mr-2`}></div>
              {face.name}
              {processedFaces.has(face.id) && (
                <CheckCircle className="w-4 h-4 ml-1 text-green-500" />
              )}
              {errors[face.id] && (
                <AlertCircle className="w-4 h-4 ml-1 text-yellow-500" />
              )}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Face Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${CUBE_FACES.find(f => f.id === selectedFace)?.color} rounded-sm`}></div>
                    <span>{CUBE_FACES.find(f => f.id === selectedFace)?.name} Face</span>
                  </CardTitle>
                  {errors[selectedFace] && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Manual adjustment needed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Original Image</h4>
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {faceImages[selectedFace as keyof typeof faceImages] && (
                        <img
                          src={faceImages[selectedFace as keyof typeof faceImages]}
                          alt={`${selectedFace} face`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Color Grid */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Detected Colors</h4>
                    <FaceGrid
                      colors={faceColors[selectedFace as keyof typeof faceColors] || Array(9).fill('white')}
                      onColorClick={(index) => {
                        // Handle color selection - will be managed by ColorPalette
                      }}
                      selectedSquare={null}
                    />
                    {processing && selectedFace && !processedFaces.has(selectedFace) && (
                      <div className="mt-2 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Faces Overview */}
            <Card>
              <CardHeader>
                <CardTitle>All Faces Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CUBE_FACES.map((face) => (
                    <div
                      key={face.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedFace === face.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedFace(face.id)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 ${face.color} rounded-sm`}></div>
                        <span className="text-sm font-medium">{face.name}</span>
                        {processedFaces.has(face.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-0.5">
                        {(faceColors[face.id as keyof typeof faceColors] || Array(9).fill('white')).map((color, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-sm ${
                              color === 'white' ? 'bg-white border border-gray-300' :
                              color === 'yellow' ? 'bg-yellow-400' :
                              color === 'red' ? 'bg-red-500' :
                              color === 'orange' ? 'bg-orange-500' :
                              color === 'green' ? 'bg-green-500' :
                              color === 'blue' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Palette */}
          <div>
            <ColorPalette
              selectedFace={selectedFace}
              colors={faceColors[selectedFace as keyof typeof faceColors] || Array(9).fill('white')}
              onColorChange={(squareIndex, color) => handleColorChange(selectedFace, squareIndex, color)}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!allProcessed}
            className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 hover:from-red-600 hover:via-green-600 hover:to-blue-600 text-white border-0"
          >
            View 3D Cube
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
