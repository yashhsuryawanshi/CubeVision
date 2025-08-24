import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, RotateCcw, Save, Share, Maximize } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import * as THREE from "three";

interface CubeVisualizationProps {
  onBack: () => void;
}

// 3D Rubik's Cube Component
function RubiksCube({ faceColors }: { faceColors: any }) {
  const cubeSize = 1;
  const gap = 0.05;
  const smallCubeSize = (cubeSize - 2 * gap) / 3;

  // Color mapping
  const colorMap: Record<string, string> = {
    white: '#ffffff',
    yellow: '#ffff00',
    red: '#ff0000',
    orange: '#ff6600',
    green: '#00ff00',
    blue: '#0000ff',
  };

  // Face mapping for 3D positioning
  const getFaceColor = (x: number, y: number, z: number, face: string) => {
    let index = 0;
    if (face === 'front' && z === 1) {
      index = (2 - y) * 3 + x;
      return faceColors.front?.[index] || 'white';
    }
    if (face === 'back' && z === -1) {
      index = (2 - y) * 3 + (2 - x);
      return faceColors.back?.[index] || 'orange';
    }
    if (face === 'right' && x === 1) {
      index = (2 - y) * 3 + (2 - z);
      return faceColors.right?.[index] || 'blue';
    }
    if (face === 'left' && x === -1) {
      index = (2 - y) * 3 + z;
      return faceColors.left?.[index] || 'green';
    }
    if (face === 'top' && y === 1) {
      index = (2 - z) * 3 + x;
      return faceColors.top?.[index] || 'white';
    }
    if (face === 'bottom' && y === -1) {
      index = z * 3 + x;
      return faceColors.bottom?.[index] || 'yellow';
    }
    return 'gray';
  };

  const smallCubes = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const position: [number, number, number] = [
          x * (smallCubeSize + gap),
          y * (smallCubeSize + gap),
          z * (smallCubeSize + gap),
        ];

        // Determine visible faces and their colors
        const materials = [];
        
        // Right face (+X)
        if (x === 1) {
          const color = getFaceColor(x, y, z, 'right');
          materials[0] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[0] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }
        
        // Left face (-X)
        if (x === -1) {
          const color = getFaceColor(x, y, z, 'left');
          materials[1] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[1] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }
        
        // Top face (+Y)
        if (y === 1) {
          const color = getFaceColor(x, y, z, 'top');
          materials[2] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[2] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }
        
        // Bottom face (-Y)
        if (y === -1) {
          const color = getFaceColor(x, y, z, 'bottom');
          materials[3] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[3] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }
        
        // Front face (+Z)
        if (z === 1) {
          const color = getFaceColor(x, y, z, 'front');
          materials[4] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[4] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }
        
        // Back face (-Z)
        if (z === -1) {
          const color = getFaceColor(x, y, z, 'back');
          materials[5] = new THREE.MeshStandardMaterial({ color: colorMap[color] || color });
        } else {
          materials[5] = new THREE.MeshStandardMaterial({ color: '#111111' });
        }

        smallCubes.push(
          <mesh key={`${x}-${y}-${z}`} position={position}>
            <boxGeometry args={[smallCubeSize, smallCubeSize, smallCubeSize]} />
            {materials.map((material, i) => (
              <meshStandardMaterial key={i} attach={`material-${i}`} {...material} />
            ))}
          </mesh>
        );
      }
    }
  }

  return <group>{smallCubes}</group>;
}

export default function CubeVisualization({ onBack }: CubeVisualizationProps) {
  const { faceColors, saveCube } = useCube();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSave = () => {
    saveCube();
    // Show success message or toast
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Rubik\'s Cube - CubeVision',
          text: 'Check out my scanned Rubik\'s Cube!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your 3D Rubik's Cube
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Interact with your cube - rotate, zoom, and explore every angle
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Interactive 3D Model</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 ${
                    isFullscreen ? 'fixed inset-0 z-50' : 'h-96 lg:h-[600px]'
                  }`}
                >
                  <Canvas
                    camera={{ position: [4, 4, 4], fov: 45 }}
                    shadows
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight
                      position={[5, 5, 5]}
                      intensity={0.8}
                      castShadow
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                    />
                    
                    <Suspense fallback={null}>
                      <RubiksCube faceColors={faceColors} />
                      <ContactShadows
                        position={[0, -2, 0]}
                        opacity={0.4}
                        width={10}
                        height={10}
                        blur={1.5}
                        far={2}
                      />
                      <Environment preset="city" />
                    </Suspense>
                    
                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={3}
                      maxDistance={10}
                      autoRotate={false}
                    />
                  </Canvas>
                  
                  {isFullscreen && (
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="bg-white/90 dark:bg-gray-900/90"
                      >
                        Exit Fullscreen
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Click and drag to rotate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Scroll to zoom in/out</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Double-click to reset view</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Cube
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solver Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The solving algorithm is in development. For now, explore your cube in 3D!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Color Detection
          </Button>
        </div>
      </div>
    </div>
  );
}
