import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import { validateCubeState } from "../../lib/roboflow";
import ColorPalette from "./ColorPalette";
import FaceGrid from "./FaceGrid";

interface ColorDetectionProps {
  onNext: () => void;
  onBack: () => void;
}

const CUBE_FACES = [
  { id: 'front', name: 'Front' },
  { id: 'back', name: 'Back' },
  { id: 'left', name: 'Left' },
  { id: 'right', name: 'Right' },
  { id: 'top', name: 'Top' },
  { id: 'bottom', name: 'Bottom' },
] as const;

const COLORS = ['white', 'yellow', 'red', 'orange', 'green', 'blue'] as const;

export default function ColorDetection({ onNext, onBack }: ColorDetectionProps) {
  const { faceImages, faceColors, setFaceColors } = useCube();
  const [selectedFace, setSelectedFace] = useState<string>('front');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOriginal, setShowOriginal] = useState(false);

  // All faces are already processed in ImageUpload component
  const processedFaces = new Set(Object.keys(faceColors));

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

  const validation = validateCubeState(faceColors);
  const allProcessed = processedFaces.size === Object.keys(faceImages).length;
  const isValid = validation.isValid;

  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8 animate-fade-in">
            <h1 className="text-display-sm text-white font-extrabold tracking-tight mb-6">
              <span className="text-coral">CubeVision</span> Detection
            </h1>
            <p className="text-xl text-white-80 max-w-2xl mx-auto leading-relaxed mb-8 animate-slide-in">
              Review and edit the AI-detected colors. Click any square to change its color if needed.
            </p>

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
                    <span className="text-white font-medium">Check color distribution - {validation.errors.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Face Selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-scale-in">
            {CUBE_FACES.map((face) => (
              <button
                key={face.id}
                onClick={() => setSelectedFace(face.id)}
                className={`glass-panel px-4 py-3 flex items-center space-x-2 transition-smooth animate-on-hover ${
                  selectedFace === face.id ? 'bg-orchid/20 border-orchid/30' : 'hover:bg-white-10'
                }`}
              >
                <div className={`w-4 h-4 rounded-sm border border-white-40 transition-smooth ${processedFaces.has(face.id) ? 'bg-orchid animate-pulse-glow' : 'bg-white-10'}`}></div>
                <span className="text-white font-medium">{face.name}</span>
                {processedFaces.has(face.id) && (
                  <CheckCircle className="w-4 h-4 text-orchid animate-scale-in" />
                )}
                {errors[face.id] && (
                  <AlertCircle className="w-4 h-4 text-coral animate-scale-in" />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Face Editor */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-lg border border-white-40 ${processedFaces.has(selectedFace) ? 'bg-orchid' : 'bg-white-10'}`}></div>
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
                  </div>
                </div>
              </div>

              {/* All Faces Preview */}
              <div className="glass-panel p-6 animate-slide-in">
                <h3 className="text-2xl font-bold text-white mb-6">All Faces</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {CUBE_FACES.map((face) => (
                    <div key={face.id} className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className={`w-3 h-3 rounded-sm border border-white-40 transition-smooth ${processedFaces.has(face.id) ? 'bg-orchid animate-pulse-glow' : 'bg-white-10'}`}></div>
                        <span className="text-sm font-medium text-white">{face.name}</span>
                        {processedFaces.has(face.id) ? (
                          <CheckCircle className="w-4 h-4 text-orchid animate-scale-in" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white-40"></div>
                        )}
                      </div>
                      <FaceGrid
                        colors={faceColors[face.id as keyof typeof faceColors] || Array(9).fill('white')}
                        size="sm"
                      />
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
            <button onClick={onBack} className="btn-outline px-6 py-3 flex items-center space-x-2 animate-on-hover">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Upload</span>
            </button>
            
            <button 
              onClick={onNext} 
              disabled={!allProcessed}
              className={`btn-primary px-6 py-3 flex items-center space-x-2 animate-on-hover ${!allProcessed ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
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