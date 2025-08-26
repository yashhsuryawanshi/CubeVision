import { useState } from "react";
import { Upload, Camera, RotateCw, Check, ArrowLeft, ArrowRight, Loader2, AlertCircle, Crop } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import { detectColorsFromImage } from "../../lib/roboflow";
import ImageCropper from "../ImageCropper";
import ColorEditor from "./ColorEditor";

interface ImageUploadProps {
  onNext: () => void;
  onBack: () => void;
}

const CUBE_FACES = [
  { id: 'front', name: 'Front', instruction: 'Hold the cube with front face towards you' },
  { id: 'back', name: 'Back', instruction: 'Rotate cube 180° to show back face' },
  { id: 'left', name: 'Left', instruction: 'Show the left side face' },
  { id: 'right', name: 'Right', instruction: 'Show the right side face' },
  { id: 'top', name: 'Top', instruction: 'Tilt cube to show top face clearly' },
  { id: 'bottom', name: 'Bottom', instruction: 'Flip cube to show bottom face' },
] as const;

export default function ImageUpload({ onNext, onBack }: ImageUploadProps) {
  const [currentFace, setCurrentFace] = useState(0);
  const [processingFaces, setProcessingFaces] = useState<Set<string>>(new Set());
  const [processingErrors, setProcessingErrors] = useState<Record<string, string>>({});
  const [showCropper, setShowCropper] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showColorEditor, setShowColorEditor] = useState(false);
  const [editorData, setEditorData] = useState<{
    faceId: string;
    faceName: string;
    image: string;
    detectedColors: string[];
  } | null>(null);
  const { faceImages, setFaceImage, faceColors, setFaceColors } = useCube();
  
  const processImageColors = async (faceId: string, imageDataUrl: string) => {
    setProcessingFaces(prev => new Set([...Array.from(prev), faceId]));
    setProcessingErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[faceId];
      return newErrors;
    });

    try {
      console.log(`🔍 Starting color detection for ${faceId} face...`);
      
      // Use server-side detection directly for better accuracy and consistent mapping
      const response = await fetch('/api/detect-colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageDataUrl,
          provider: 'roboflow' // Force Roboflow for consistent accurate results
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const colors = result.colors;
      
      console.log(`✅ Detected colors for ${faceId}:`, colors);
      
      // Show color editor for user to verify/edit colors
      const faceName = CUBE_FACES.find(f => f.id === faceId)?.name || faceId;
      setEditorData({
        faceId,
        faceName,
        image: imageDataUrl,
        detectedColors: colors
      });
      setShowColorEditor(true);
      
    } catch (error) {
      console.error(`❌ Error processing ${faceId}:`, error);
      setProcessingErrors(prev => ({ ...prev, [faceId]: 'Failed to detect colors' }));
      // Set fallback colors and proceed
      setFaceColors(faceId as any, Array(9).fill('white'));
    } finally {
      setProcessingFaces(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(faceId);
        return newSet;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPendingImage(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    const faceId = CUBE_FACES[currentFace].id;
    setFaceImage(faceId as any, croppedImageUrl);
    setShowCropper(false);
    setPendingImage(null);
    
    // Process colors immediately (will trigger color editor)
    await processImageColors(faceId, croppedImageUrl);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setPendingImage(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPendingImage(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleColorEditorSave = (colors: string[]) => {
    if (editorData) {
      setFaceColors(editorData.faceId as any, colors);
      setShowColorEditor(false);
      setEditorData(null);
      
      // Auto-advance to next face after saving
      if (currentFace < CUBE_FACES.length - 1) {
        setTimeout(() => setCurrentFace(currentFace + 1), 500);
      }
    }
  };

  const handleColorEditorCancel = () => {
    if (editorData) {
      // Use detected colors as fallback
      setFaceColors(editorData.faceId as any, editorData.detectedColors);
      setShowColorEditor(false);
      setEditorData(null);
      
      // Auto-advance to next face after canceling
      if (currentFace < CUBE_FACES.length - 1) {
        setTimeout(() => setCurrentFace(currentFace + 1), 500);
      }
    }
  };

  const progress = (Object.keys(faceColors).length / CUBE_FACES.length) * 100;
  const allImagesProcessed = Object.keys(faceColors).length === CUBE_FACES.length;

  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8 animate-fade-in">
            <h1 className="text-display-sm text-white font-extrabold tracking-tight mb-6">
              Capture Your <span className="text-coral">Cube</span>
            </h1>
            <p className="text-xl text-white-80 max-w-2xl mx-auto leading-relaxed mb-8 animate-slide-in">
              Upload or capture images of all 6 faces of your Rubik's Cube for <span className="text-coral font-semibold">CubeVision</span> to analyze
            </p>
            
            <div className="max-w-md mx-auto mb-6">
              <div className="glass-panel p-4">
                <div className="w-full bg-white-10 rounded-full h-3 mb-3">
                  <div 
                    className="bg-coral h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-white-80">
                  {Object.keys(faceColors).length} of {CUBE_FACES.length} faces processed
                </p>
              </div>
            </div>
          </div>

          {/* Face Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-scale-in">
            {CUBE_FACES.map((face, index) => (
              <button
                key={face.id}
                onClick={() => setCurrentFace(index)}
                className={`glass-panel px-4 py-3 flex items-center space-x-2 transition-smooth animate-on-hover ${
                  currentFace === index ? 'bg-orchid/20 border-orchid/30' : 'hover:bg-white-10'
                }`}
              >
                <div className={`w-4 h-4 rounded-sm border border-white-40 transition-smooth ${
                  processingFaces.has(face.id) ? 'bg-yellow-400' :
                  faceColors[face.id as keyof typeof faceColors] ? 'bg-orchid animate-pulse-glow' : 
                  faceImages[face.id as keyof typeof faceImages] ? 'bg-blue-400' : 'bg-white-10'
                }`}></div>
                <span className="text-white font-medium">{face.name}</span>
                {processingFaces.has(face.id) && (
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                )}
                {processingErrors[face.id] && (
                  <AlertCircle className="w-4 h-4 text-coral animate-scale-in" />
                )}
                {faceColors[face.id as keyof typeof faceColors] && !processingFaces.has(face.id) && (
                  <Check className="w-4 h-4 text-orchid animate-scale-in" />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="glass-panel p-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-6 h-6 rounded-lg border border-white-40 transition-smooth ${
                  processingFaces.has(CUBE_FACES[currentFace].id) ? 'bg-yellow-400' :
                  faceColors[CUBE_FACES[currentFace].id as keyof typeof faceColors] ? 'bg-orchid animate-pulse-glow' : 
                  faceImages[CUBE_FACES[currentFace].id as keyof typeof faceImages] ? 'bg-blue-400' : 'bg-white-10'
                }`}></div>
                <h2 className="text-2xl font-bold text-white">{CUBE_FACES[currentFace].name} Face</h2>
                {processingFaces.has(CUBE_FACES[currentFace].id) && (
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                )}
              </div>

              <div className="mb-6 p-4 bg-steel/20 rounded-2xl border border-steel/30">
                <div className="flex items-center space-x-2 mb-2">
                  <RotateCw className="w-5 h-5 text-orchid" />
                  <span className="font-semibold text-white">Orientation Guide:</span>
                </div>
                <p className="text-sm text-white-80">
                  {CUBE_FACES[currentFace].instruction}
                </p>
              </div>

              <div
                className="border-2 border-dashed border-white-20 rounded-2xl p-8 text-center hover:border-orchid/50 transition-smooth cursor-pointer bg-white-10/50 animate-on-hover"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById(`file-input-${currentFace}`)?.click()}
              >
                {faceImages[CUBE_FACES[currentFace].id as keyof typeof faceImages] ? (
                  <div className="space-y-4">
                    <img
                      src={faceImages[CUBE_FACES[currentFace].id as keyof typeof faceImages]}
                      alt={`${CUBE_FACES[currentFace].name} face`}
                      className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-glass"
                    />
                    <div className="flex items-center justify-center space-x-2 text-orchid">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Image uploaded successfully</span>
                    </div>
                    <p className="text-sm text-white-80">
                      Click to replace image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-white-80 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-white mb-2">
                        Upload {CUBE_FACES[currentFace].name} Face Image
                      </p>
                      <p className="text-sm text-white-80">
                        Drag and drop or click to select
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  id={`file-input-${currentFace}`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => document.getElementById(`file-input-${currentFace}`)?.click()}
                  className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2 animate-on-hover"
                >
                  <Crop className="w-5 h-5" />
                  <span>Upload & Crop</span>
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          setPendingImage(result);
                          setShowCropper(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2 animate-on-hover"
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
              </div>
            </div>

            {/* Preview Grid with Colors */}
            <div className="glass-panel p-6 animate-slide-in">
              <h3 className="text-2xl font-bold text-white mb-6">Detected Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                {CUBE_FACES.map((face) => (
                  <div key={face.id} className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-sm border border-white-40 ${
                        processingFaces.has(face.id) ? 'bg-yellow-400' :
                        faceColors[face.id as keyof typeof faceColors] ? 'bg-orchid' : 
                        faceImages[face.id as keyof typeof faceImages] ? 'bg-blue-400' : 'bg-white-10'
                      }`}></div>
                      <span className="text-sm font-medium text-white">{face.name}</span>
                      {processingFaces.has(face.id) && (
                        <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                      )}
                      {faceColors[face.id as keyof typeof faceColors] && !processingFaces.has(face.id) && (
                        <Check className="w-3 h-3 text-orchid" />
                      )}
                      {processingErrors[face.id] && (
                        <AlertCircle className="w-3 h-3 text-coral" />
                      )}
                    </div>
                    
                    {/* Color Grid */}
                    <div className="grid grid-cols-3 gap-0.5 mb-2">
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
                    
                    {/* Image thumbnail */}
                    {faceImages[face.id as keyof typeof faceImages] && (
                      <div className="aspect-square border border-white-20 rounded-lg overflow-hidden bg-white-10/50 mt-2">
                        <img
                          src={faceImages[face.id as keyof typeof faceImages]}
                          alt={`${face.name} face`}
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button 
              onClick={onBack} 
              className="btn-outline px-6 py-3 flex items-center space-x-2 animate-on-hover"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <button 
              onClick={onNext} 
              disabled={!allImagesProcessed}
              className={`btn-primary px-6 py-3 flex items-center space-x-2 animate-on-hover ${!allImagesProcessed ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
            >
              <span>Review & Edit</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && pendingImage && (
        <ImageCropper
          imageUrl={pendingImage}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Color Editor Modal */}
      {showColorEditor && editorData && (
        <ColorEditor
          faceId={editorData.faceId}
          faceName={editorData.faceName}
          originalImage={editorData.image}
          detectedColors={editorData.detectedColors}
          onSave={handleColorEditorSave}
          onCancel={handleColorEditorCancel}
        />
      )}
    </div>
  );
}