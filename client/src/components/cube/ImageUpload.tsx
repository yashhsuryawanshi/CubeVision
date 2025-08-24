import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Upload, Camera, RotateCw, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";

interface ImageUploadProps {
  onNext: () => void;
  onBack: () => void;
}

const CUBE_FACES = [
  { id: 'front', name: 'Front', color: 'bg-red-500', instruction: 'Hold the cube with red face towards you' },
  { id: 'back', name: 'Back', color: 'bg-orange-500', instruction: 'Rotate cube 180° to show back face' },
  { id: 'left', name: 'Left', color: 'bg-green-500', instruction: 'Show the left side face' },
  { id: 'right', name: 'Right', color: 'bg-blue-500', instruction: 'Show the right side face' },
  { id: 'top', name: 'Top', color: 'bg-white', instruction: 'Tilt cube to show top face clearly' },
  { id: 'bottom', name: 'Bottom', color: 'bg-yellow-400', instruction: 'Flip cube to show bottom face' },
] as const;

export default function ImageUpload({ onNext, onBack }: ImageUploadProps) {
  const [currentFace, setCurrentFace] = useState(0);
  const { faceImages, setFaceImage } = useCube();
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaceImage(CUBE_FACES[currentFace].id as any, result);
        
        // Auto-advance to next face
        if (currentFace < CUBE_FACES.length - 1) {
          setTimeout(() => setCurrentFace(currentFace + 1), 500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaceImage(CUBE_FACES[currentFace].id as any, result);
        
        // Auto-advance to next face
        if (currentFace < CUBE_FACES.length - 1) {
          setTimeout(() => setCurrentFace(currentFace + 1), 500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const progress = (Object.keys(faceImages).length / CUBE_FACES.length) * 100;
  const allImagesUploaded = Object.keys(faceImages).length === CUBE_FACES.length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Capture Your Cube Faces
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Upload or capture images of all 6 faces of your Rubik's Cube
          </p>
          
          <div className="max-w-md mx-auto mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Object.keys(faceImages).length} of {CUBE_FACES.length} faces captured
            </p>
          </div>
        </div>

        {/* Face Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CUBE_FACES.map((face, index) => (
            <Button
              key={face.id}
              onClick={() => setCurrentFace(index)}
              variant={currentFace === index ? "default" : "outline"}
              size="sm"
              className="relative"
            >
              <div className={`w-3 h-3 ${face.color} rounded-sm mr-2`}></div>
              {face.name}
              {faceImages[face.id as keyof typeof faceImages] && (
                <Check className="w-4 h-4 ml-1 text-green-500" />
              )}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-4 h-4 ${CUBE_FACES[currentFace].color} rounded-sm`}></div>
                <span>{CUBE_FACES[currentFace].name} Face</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <RotateCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Orientation Guide:</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {CUBE_FACES[currentFace].instruction}
                </p>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById(`file-input-${currentFace}`)?.click()}
              >
                {faceImages[CUBE_FACES[currentFace].id as keyof typeof faceImages] ? (
                  <div className="space-y-4">
                    <img
                      src={faceImages[CUBE_FACES[currentFace].id as keyof typeof faceImages]}
                      alt={`${CUBE_FACES[currentFace].name} face`}
                      className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md"
                    />
                    <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Image uploaded successfully</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to replace image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Upload {CUBE_FACES[currentFace].name} Face Image
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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

              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={() => document.getElementById(`file-input-${currentFace}`)?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <Button
                  onClick={() => {
                    // Trigger camera input
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
                          setFaceImage(CUBE_FACES[currentFace].id as any, result);
                          if (currentFace < CUBE_FACES.length - 1) {
                            setTimeout(() => setCurrentFace(currentFace + 1), 500);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Faces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {CUBE_FACES.map((face) => (
                  <div
                    key={face.id}
                    className="aspect-square border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center"
                  >
                    {faceImages[face.id as keyof typeof faceImages] ? (
                      <img
                        src={faceImages[face.id as keyof typeof faceImages]}
                        alt={`${face.name} face`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className={`w-8 h-8 ${face.color} rounded-sm mx-auto mb-2 opacity-50`}></div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{face.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!allImagesUploaded}
            className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 hover:from-red-600 hover:via-green-600 hover:to-blue-600 text-white border-0"
          >
            Process Images
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
