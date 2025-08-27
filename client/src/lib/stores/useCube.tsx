import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Solution } from "../solvers/Solver";
import { Move } from "../cubeUtils";

export interface CubeFace {
  front: string;
  back: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
}

export interface CubeColors {
  front: string[];
  back: string[];
  left: string[];
  right: string[];
  top: string[];
  bottom: string[];
}

interface CubeState {
  // Image data for each face
  faceImages: Partial<CubeFace>;
  
  // Detected/corrected colors for each face (9 squares each)
  faceColors: Partial<CubeColors>;
  
  // Overall cube state
  cubeState: 'empty' | 'images_uploaded' | 'colors_detected' | 'ready_to_solve' | 'solving' | 'solved';
  
  // Solving state
  solution: Solution | null;
  solverMethod: 'beginner' | 'kociemba';
  currentStepIndex: number;
  currentMoveIndex: number;
  isPlaying: boolean;
  isAnimating: boolean;
  animationSpeed: number;
  highlightLayer: string | null;
  
  // Saved cubes
  savedCubes: Array<{
    id: string;
    name: string;
    timestamp: number;
    faceImages: Partial<CubeFace>;
    faceColors: Partial<CubeColors>;
  }>;

  // Actions
  setFaceImage: (face: keyof CubeFace, imageData: string) => void;
  setFaceColors: (face: keyof CubeColors, colors: string[]) => void;
  setCubeState: (state: CubeState['cubeState']) => void;
  resetCube: () => void;
  saveCube: (name?: string) => void;
  loadCube: (cubeId: string) => void;
  deleteSavedCube: (cubeId: string) => void;
  
  // Solving actions
  setSolution: (solution: Solution) => void;
  setSolverMethod: (method: 'beginner' | 'kociemba') => void;
  setCurrentStep: (stepIndex: number) => void;
  setCurrentMove: (moveIndex: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsAnimating: (animating: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setHighlightLayer: (layer: string | null) => void;
  resetSolving: () => void;
}

export const useCube = create<CubeState>()(
  persist(
    (set, get) => ({
      faceImages: {},
      faceColors: {},
      cubeState: 'empty',
      savedCubes: [],
      
      // Solving state
      solution: null,
      solverMethod: 'beginner',
      currentStepIndex: 0,
      currentMoveIndex: 0,
      isPlaying: false,
      isAnimating: false,
      animationSpeed: 1.0,
      highlightLayer: null,

      setFaceImage: (face, imageData) => {
        set((state) => {
          const newFaceImages = { ...state.faceImages, [face]: imageData };
          const allImagesUploaded = Object.keys(newFaceImages).length === 6;
          
          return {
            faceImages: newFaceImages,
            cubeState: allImagesUploaded ? 'images_uploaded' : state.cubeState
          };
        });
      },

      setFaceColors: (face, colors) => {
        set((state) => {
          const newFaceColors = { ...state.faceColors, [face]: colors };
          const allColorsDetected = Object.keys(newFaceColors).length === 6;
          
          return {
            faceColors: newFaceColors,
            cubeState: allColorsDetected ? 'colors_detected' : state.cubeState
          };
        });
      },

      setCubeState: (cubeState) => {
        set({ cubeState });
      },

      resetCube: () => {
        set({
          faceImages: {},
          faceColors: {},
          cubeState: 'empty',
          solution: null,
          currentStepIndex: 0,
          currentMoveIndex: 0,
          isPlaying: false,
          isAnimating: false,
          highlightLayer: null
        });
      },

      saveCube: (name) => {
        const state = get();
        const cubeName = name || `Cube ${new Date().toLocaleDateString()}`;
        const newCube = {
          id: Date.now().toString(),
          name: cubeName,
          timestamp: Date.now(),
          faceImages: state.faceImages,
          faceColors: state.faceColors
        };

        set((state) => ({
          savedCubes: [...state.savedCubes, newCube]
        }));

        return newCube.id;
      },

      loadCube: (cubeId) => {
        const state = get();
        const cube = state.savedCubes.find(c => c.id === cubeId);
        
        if (cube) {
          set({
            faceImages: cube.faceImages,
            faceColors: cube.faceColors,
            cubeState: 'ready_to_solve'
          });
        }
      },

      deleteSavedCube: (cubeId) => {
        set((state) => ({
          savedCubes: state.savedCubes.filter(c => c.id !== cubeId)
        }));
      },

      // Solving actions
      setSolution: (solution) => {
        set({ solution, cubeState: 'ready_to_solve' });
      },

      setSolverMethod: (method) => {
        set({ solverMethod: method });
      },

      setCurrentStep: (stepIndex) => {
        set({ currentStepIndex: stepIndex });
      },

      setCurrentMove: (moveIndex) => {
        set({ currentMoveIndex: moveIndex });
      },

      setIsPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setIsAnimating: (animating) => {
        set({ isAnimating: animating });
      },

      setAnimationSpeed: (speed) => {
        set({ animationSpeed: speed });
      },

      setHighlightLayer: (layer) => {
        set({ highlightLayer: layer });
      },

      resetSolving: () => {
        set({
          solution: null,
          currentStepIndex: 0,
          currentMoveIndex: 0,
          isPlaying: false,
          isAnimating: false,
          highlightLayer: null
        });
      }
    }),
    {
      name: 'cube-storage',
      partialize: (state) => ({
        savedCubes: state.savedCubes
      })
    }
  )
);
