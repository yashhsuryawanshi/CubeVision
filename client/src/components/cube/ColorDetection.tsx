import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import { detectColorsFromImage } from "../../lib/roboflow";
import ColorPalette from "./ColorPalette";
import FaceGrid from "./FaceGrid";

interface ColorDetectionProps {
  onNext: () => void;
  onBack: () => void;
}

const CUBE_FACES = [
  { id: 'front', name: 'Front', color: 'bg-red-500' },
  { id: 'back', name: 'Back', color: 'bg-orange-500' },
  { id: 'left', name: 'Left', color: 'bg-green-500' },
  { id: 'right', name: 'Right', color: 'bg-blue-500' },
  { id: 'top', name: 'Top', color: 'bg-white' },
  { id: 'bottom', name: 'Bottom', color: 'bg-yellow-400' },
] as const;

const COLORS = ['white', 'yellow', 'red', 'orange', 'green', 'blue'] as const;

export default function ColorDetection({ onNext, onBack }: ColorDetectionProps) {
  const { faceImages, faceColors, setFaceColors } = useCube();
  const [selectedFace, setSelectedFace] = useState<string>('front');
  const [processing, setProcessing] = useState(false);
  const [processedFaces, setProcessedFaces] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    // Auto-start processing when component mounts
    if (Object.keys(faceImages).length > 0 && processedFaces.size === 0) {
      processAllFaces();
    }
  }, []);

  const processAllFaces = async () => {
    setProcessing(true);
    const faceIds = Object.keys(faceImages);
    
    for (const faceId of faceIds) {
      try {
        const imageDataUrl = faceImages[faceId as keyof typeof faceImages];
        if (imageDataUrl) {
          // Convert data URL to blob
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();
          
          const colors = await detectColorsFromImage(imageDataUrl);
          setFaceColors(faceId as any, colors);
          setProcessedFaces(prev => new Set([...prev, faceId]));
          
          // Small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error processing ${faceId}:`, error);
        setErrors(prev => ({ ...prev, [faceId]: 'Failed to detect colors' }));
        // Set fallback colors
        setFaceColors(faceId as any, Array(9).fill('white'));
        setProcessedFaces(prev => new Set([...prev, faceId]));
      }
    }
    
    setProcessing(false);
  };

  const handleColorChange = (face: string, squareIndex: number, color: string) => {
    const currentColors = faceColors[face as keyof typeof faceColors] || Array(9).fill('white');
    const newColors = [...currentColors];
    newColors[squareIndex] = color;
    setFaceColors(face as any, newColors);
    
    // Remove error for this face if it exists
    if (errors[face]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[face];
        return newErrors;
      });
    }
  };

  const validateCube = () => {
    const colorCounts = COLORS.reduce((acc, color) => ({ ...acc, [color]: 0 }), {} as Record<string, number>);
    
    Object.values(faceColors).forEach(face => {
      if (face) {
        face.forEach(color => {
          if (color in colorCounts) {
            colorCounts[color]++;
          }
        });
      }
    });
    
    // Each color should appear exactly 9 times
    return Object.values(colorCounts).every(count => count === 9);
  };

  const progress = (processedFaces.size / Object.keys(faceImages).length) * 100;
  const allProcessed = processedFaces.size === Object.keys(faceImages).length && !processing;
  const isValid = validateCube();

  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-display-sm text-white font-extrabold tracking-tight mb-6">
              Color Detection
            </h1>
            <p className="text-xl text-white-80 max-w-2xl mx-auto leading-relaxed mb-8">
              AI-detected colors are shown below. Click any square to manually correct colors.
            </p>
          
            {processing && (
              <div className="max-w-md mx-auto mb-6">
                <div className="glass-panel p-4">
                  <div className="w-full bg-white-10 rounded-full h-3 mb-3">
                    <div 
                      className="bg-orchid h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-orchid" />
                    <p className="text-sm text-white-80">
                      Processing images with AI... {Math.round(progress)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {allProcessed && (
              <div className="glass-panel p-4 max-w-md mx-auto mb-6">
                <div className="flex items-center justify-center space-x-2">
                  {isValid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-orchid" />
                      <span className="text-white font-medium">Cube state is valid!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-coral" />
                      <span className="text-white font-medium">Please check color distribution</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Face Selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CUBE_FACES.map((face) => (
              <button
                key={face.id}
                onClick={() => setSelectedFace(face.id)}
                className={`glass-panel px-4 py-3 flex items-center space-x-2 transition-smooth ${
                  selectedFace === face.id ? 'bg-orchid/20 border-orchid/30' : 'hover:bg-white-10'
                }`}
              >
                <div className={`w-4 h-4 ${face.color} rounded-sm`}></div>
                <span className="text-white font-medium">{face.name}</span>
                {processedFaces.has(face.id) && (
                  <CheckCircle className="w-4 h-4 text-orchid" />
                )}
                {errors[face.id] && (
                  <AlertCircle className="w-4 h-4 text-coral" />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Face Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 ${CUBE_FACES.find(f => f.id === selectedFace)?.color} rounded-lg`}></div>
                    <h2 className="text-2xl font-bold text-white">{CUBE_FACES.find(f => f.id === selectedFace)?.name} Face</h2>
                  </div>
                  {errors[selectedFace] && (
                    <div className="bg-coral/20 border border-coral/30 px-3 py-1 rounded-full flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-coral" />
                      <span className="text-sm text-white">Manual adjustment needed</span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">Original Image</h4>
                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className="w-8 h-8 rounded-full border border-white-80 hover:bg-white-20 transition-smooth flex items-center justify-center"
                      >
                        {showOriginal ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    <div className="aspect-square bg-white-10 rounded-2xl overflow-hidden">
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
                    <h4 className="font-semibold mb-3 text-white">Detected Colors</h4>
                    <FaceGrid
                      colors={faceColors[selectedFace as keyof typeof faceColors] || Array(9).fill('white')}
                      onColorClick={(index) => {
                        // Color selection is handled by ColorPalette
                      }}
                      selectedSquare={null}
                    />
                    {processing && selectedFace && !processedFaces.has(selectedFace) && (
                      <div className="mt-2 flex items-center justify-center space-x-2 text-orchid">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Faces Preview */}
              <div className="glass-panel p-6">
                <h3 className="text-2xl font-bold text-white mb-6">All Faces</h3>
                <div className="grid grid-cols-3 gap-4">
                  {CUBE_FACES.map((face) => (
                    <div key={face.id} className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className={`w-3 h-3 ${face.color} rounded-sm`}></div>
                        <span className="text-sm font-medium text-white">{face.name}</span>
                        {processedFaces.has(face.id) ? (
                          <CheckCircle className="w-4 h-4 text-orchid" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white-40"></div>
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
              </div>
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
          <div className="flex justify-between mt-12">
            <button onClick={onBack} className="btn-outline px-6 py-3 flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Upload</span>
            </button>
            
            <button 
              onClick={onNext} 
              disabled={!allProcessed}
              className={`btn-primary px-6 py-3 flex items-center space-x-2 ${!allProcessed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>View 3D Cube</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}