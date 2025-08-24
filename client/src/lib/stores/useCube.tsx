import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  cubeState: 'empty' | 'images_uploaded' | 'colors_detected' | 'ready_to_solve' | 'solved';
  
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
}

export const useCube = create<CubeState>()(
  persist(
    (set, get) => ({
      faceImages: {},
      faceColors: {},
      cubeState: 'empty',
      savedCubes: [],

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
          cubeState: 'empty'
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
