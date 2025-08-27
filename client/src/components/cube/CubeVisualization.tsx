import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { ArrowLeft, Maximize, RotateCcw, Play } from "lucide-react";
import { useCube } from "../../lib/stores/useCube";
import Cube3D from "./Cube3D";
import LearningPanel from "./LearningPanel";
import { getSolution } from "../../lib/solvers/RealCubeSolver";
import { CubeStateManager } from "../../lib/cubeStateManager";
import * as THREE from "three";

interface CubeVisualizationProps {
  onBack: () => void;
}



export default function CubeVisualization({ onBack }: CubeVisualizationProps) {
  const { 
    faceColors, 
    solution, 
    solverMethod, 
    currentStepIndex, 
    currentMoveIndex, 
    isPlaying, 
    isAnimating, 
    animationSpeed,
    highlightLayer,
    setSolution, 
    setSolverMethod, 
    setCurrentStep, 
    setCurrentMove, 
    setIsPlaying, 
    setIsAnimating, 
    setAnimationSpeed,
    setHighlightLayer,
    resetSolving 
  } = useCube();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSolvingInterface, setShowSolvingInterface] = useState(false);

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

  // Initialize solution when component mounts
  useEffect(() => {
    if (!solution && Object.keys(faceColors).length === 6) {
      const newSolution = getSolution(faceColors as any, solverMethod);
      if (newSolution) {
        setSolution(newSolution);
      }
    }
  }, [faceColors, solverMethod, solution, setSolution]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || !solution || isAnimating) return;

    const timer = setTimeout(() => {
      handleNextMove();
    }, 1000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, currentMoveIndex, animationSpeed, isAnimating, solution]);

  const getCurrentMove = () => {
    if (!solution) return null;
    const currentStep = solution.steps[currentStepIndex];
    if (!currentStep || currentMoveIndex >= currentStep.moves.length) return null;
    return currentStep.moves[currentMoveIndex];
  };

  const handleStartSolving = () => {
    setShowSolvingInterface(true);
    if (!solution) {
      const newSolution = getSolution(faceColors as any, solverMethod);
      if (newSolution) {
        setSolution(newSolution);
      }
    }
  };

  const handleMethodChange = (method: 'beginner' | 'kociemba') => {
    setSolverMethod(method);
    resetSolving();
    const newSolution = getSolution(faceColors as any, method);
    if (newSolution) {
      setSolution(newSolution);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNextMove = () => {
    if (!solution) return;
    
    const currentStep = solution.steps[currentStepIndex];
    if (!currentStep) return;

    if (currentMoveIndex < currentStep.moves.length - 1) {
      setCurrentMove(currentMoveIndex + 1);
    } else if (currentStepIndex < solution.steps.length - 1) {
      setCurrentStep(currentStepIndex + 1);
      setCurrentMove(0);
    } else {
      setIsPlaying(false); // End of solution
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setHighlightLayer(null);
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const handleMoveChange = (moveIndex: number) => {
    setCurrentMove(moveIndex);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCurrentMove(0);
    setIsPlaying(false);
    setIsAnimating(false);
    setHighlightLayer(null);
  };

  const handleSpeedChange = (speed: number) => {
    // Slower default speed for better learning experience
    setAnimationSpeed(Math.max(0.3, speed * 0.6));
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl text-white font-bold tracking-tight mb-3">
              {showSolvingInterface ? 'Learning to Solve' : 'Your 3D Cube'}
            </h1>
            <p className="text-lg text-white-80 max-w-xl mx-auto">
              {showSolvingInterface ? 'Follow along step by step' : 'Interactive 3D cube visualization'}
            </p>
          </div>

          <div className={`${showSolvingInterface ? 'grid lg:grid-cols-3 gap-6' : 'flex flex-col'}`}>
            {/* 3D Viewer */}
            <div className={showSolvingInterface ? 'lg:col-span-2' : 'w-full'}>
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
                    isFullscreen ? 'fixed inset-0 z-50 bg-app-gradient' : showSolvingInterface ? 'h-80 lg:h-96' : 'h-96 lg:h-[500px]'
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
                      <Cube3D 
                        faceColors={faceColors}
                        currentMove={getCurrentMove()}
                        isAnimating={isAnimating}
                        animationSpeed={animationSpeed}
                        onAnimationComplete={handleAnimationComplete}
                        highlightLayer={highlightLayer}
                      />
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

            {!showSolvingInterface && (
              <div className="text-center mt-8">
                <div className="glass-panel p-6 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-white mb-4">Ready to Solve!</h3>
                  <p className="text-white-80 mb-6">Learn step-by-step how to solve your cube</p>
                  <button
                    onClick={handleStartSolving}
                    className="btn-primary px-6 py-3 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Learning to Solve</span>
                  </button>
                </div>
              </div>
            )}

            {/* Learning Panel */}
            {showSolvingInterface && solution && (
              <div className="lg:col-span-1">
                <LearningPanel
                  solution={solution}
                  currentStepIndex={currentStepIndex}
                  currentMoveIndex={currentMoveIndex}
                  isPlaying={isPlaying}
                  animationSpeed={animationSpeed}
                  solverMethod={solverMethod}
                  onStepChange={handleStepChange}
                  onMoveChange={handleMoveChange}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onReset={handleReset}
                  onSpeedChange={handleSpeedChange}
                  onMethodChange={handleMethodChange}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button onClick={onBack} className="btn-outline px-6 py-3 flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Detection</span>
            </button>
            
            {showSolvingInterface ? (
              <button 
                onClick={() => setShowSolvingInterface(false)}
                className="btn-outline px-6 py-3 flex items-center space-x-2"
              >
                <span>Hide Solver</span>
              </button>
            ) : (
              <button 
                onClick={handleStartSolving}
                className="btn-primary px-6 py-3 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Learn to Solve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}