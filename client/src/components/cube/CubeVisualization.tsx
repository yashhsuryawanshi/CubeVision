import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { ArrowLeft, Maximize, RotateCcw } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import * as THREE from "three";

interface CubeVisualizationProps {
  onBack: () => void;
}

// Component for individual cube face
function CubeFace({ colors, position, rotation }: { colors: string[], position: [number, number, number], rotation: [number, number, number] }) {
  const faceSize = 1;
  const squareSize = faceSize / 3;
  const offset = (faceSize - squareSize) / 2;

  const getColorHex = (color: string) => {
    const colorMap: Record<string, string> = {
      'white': '#ffffff',
      'yellow': '#ffff00',
      'red': '#ff0000',
      'orange': '#ff8000',
      'green': '#00ff00',
      'blue': '#0000ff',
    };
    return colorMap[color] || '#888888';
  };

  return (
    <group position={position} rotation={rotation}>
      {colors.map((color, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * squareSize;
        const y = (1 - row) * squareSize;
        
        return (
          <mesh key={index} position={[x, y, 0.01]}>
            <planeGeometry args={[squareSize * 0.95, squareSize * 0.95]} />
            <meshLambertMaterial color={getColorHex(color)} />
          </mesh>
        );
      })}
      {/* Face border */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[faceSize, faceSize]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
    </group>
  );
}

// Main Rubik's Cube component
function RubiksCube({ faceColors }: { faceColors: any }) {
  const faces = [
    { name: 'front', colors: faceColors.front || Array(9).fill('white'), position: [0, 0, 0.5], rotation: [0, 0, 0] },
    { name: 'back', colors: faceColors.back || Array(9).fill('white'), position: [0, 0, -0.5], rotation: [0, Math.PI, 0] },
    { name: 'right', colors: faceColors.right || Array(9).fill('white'), position: [0.5, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { name: 'left', colors: faceColors.left || Array(9).fill('white'), position: [-0.5, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { name: 'top', colors: faceColors.top || Array(9).fill('white'), position: [0, 0.5, 0], rotation: [-Math.PI / 2, 0, 0] },
    { name: 'bottom', colors: faceColors.bottom || Array(9).fill('white'), position: [0, -0.5, 0], rotation: [Math.PI / 2, 0, 0] },
  ];

  return (
    <group>
      {faces.map((face) => (
        <CubeFace 
          key={face.name}
          colors={face.colors}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
        />
      ))}
    </group>
  );
}

export default function CubeVisualization({ onBack }: CubeVisualizationProps) {
  const { faceColors } = useCube();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const validateCube = () => {
    const COLORS = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
    const colorCounts = COLORS.reduce((acc, color) => ({ ...acc, [color]: 0 }), {} as Record<string, number>);
    
    Object.values(faceColors).forEach(face => {
      if (face) {
        face.forEach((color: string) => {
          if (color in colorCounts) {
            colorCounts[color]++;
          }
        });
      }
    });
    
    return Object.values(colorCounts).every(count => count === 9);
  };

  const isValid = validateCube();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-display-sm text-white font-extrabold tracking-tight mb-6">
              Your 3D Cube
            </h1>
            <p className="text-xl text-white-80 max-w-2xl mx-auto leading-relaxed mb-8">
              Interact with your cube - rotate, zoom, and explore every angle
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* 3D Viewer */}
            <div className="lg:col-span-3">
              <div className="glass-panel overflow-hidden">
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Interactive 3D Model</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full border border-white-80 hover:bg-white-20 transition-smooth flex items-center justify-center"
                      >
                        <Maximize className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`relative ${
                    isFullscreen ? 'fixed inset-0 z-50 bg-app-gradient' : 'h-96 lg:h-[600px] bg-transparent'
                  }`}
                >
                  <Canvas
                    camera={{ position: [4, 4, 4], fov: 45 }}
                    shadows
                  >
                    <ambientLight intensity={0.4} />
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
                      <button
                        onClick={toggleFullscreen}
                        className="btn-outline px-4 py-2 text-sm bg-white-10/90 backdrop-blur-sm"
                      >
                        Exit Fullscreen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls & Info */}
            <div className="space-y-6">
              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
                <div className="text-sm text-white-80 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orchid rounded-full"></div>
                    <span>Click and drag to rotate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full"></div>
                    <span>Scroll to zoom in/out</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-steel rounded-full"></div>
                    <span>Double-click to reset view</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-4">Cube Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white-80">Total Squares:</span>
                    <span className="font-mono text-white">54</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white-80">Faces Completed:</span>
                    <span className="font-mono text-white">{Object.keys(faceColors).length}/6</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white-80">Validation:</span>
                    <span className={`font-mono ${isValid ? 'text-orchid' : 'text-coral'}`}>
                      {isValid ? 'Valid' : 'Check needed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="text-sm text-white-80">
                    <p className="mb-2">Your cube visualization is complete! You can:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Explore different angles</li>
                      <li>• Study the color patterns</li>
                      <li>• Use this for learning algorithms</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-outline w-full py-2 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Start Over</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button onClick={onBack} className="btn-outline px-6 py-3 flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Detection</span>
            </button>
            
            <button 
              onClick={() => window.open('/learning', '_blank')}
              className="btn-primary px-6 py-3 flex items-center space-x-2"
            >
              <span>Learn to Solve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}