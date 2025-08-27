import { CubeColors } from "./stores/useCube";
import { Move } from "./cubeUtils";

// Cube state manager to track cube state changes during solving
export class CubeStateManager {
  private currentState: CubeColors;
  private initialState: CubeColors;

  constructor(initialState: CubeColors) {
    this.initialState = { ...initialState };
    this.currentState = { ...initialState };
  }

  // Reset to initial state
  reset() {
    this.currentState = { ...this.initialState };
  }

  // Apply a move to the current state
  applyMove(move: Move): CubeColors {
    // This is a simplified version - in a real implementation, 
    // you would perform the actual cube rotations on the state
    this.currentState = this.performMove(this.currentState, move);
    return { ...this.currentState };
  }

  // Get current state without modifying
  getCurrentState(): CubeColors {
    return { ...this.currentState };
  }

  // Perform the actual cube rotation based on move
  private performMove(state: CubeColors, move: Move): CubeColors {
    // Create a deep copy of the state
    const newState: CubeColors = {
      front: [...(state.front || [])],
      back: [...(state.back || [])],
      left: [...(state.left || [])],
      right: [...(state.right || [])],
      top: [...(state.top || [])],
      bottom: [...(state.bottom || [])]
    };

    // Apply the move based on face and rotation
    switch (move.face) {
      case 'R':
        this.rotateRightFace(newState, move.rotation);
        break;
      case 'L':
        this.rotateLeftFace(newState, move.rotation);
        break;
      case 'U':
        this.rotateTopFace(newState, move.rotation);
        break;
      case 'D':
        this.rotateBottomFace(newState, move.rotation);
        break;
      case 'F':
        this.rotateFrontFace(newState, move.rotation);
        break;
      case 'B':
        this.rotateBackFace(newState, move.rotation);
        break;
    }

    return newState;
  }

  // Helper methods for face rotations
  private rotateFace(face: string[], clockwise: boolean = true) {
    if (!face || face.length !== 9) return;
    
    if (clockwise) {
      // Rotate face 90 degrees clockwise
      const temp = [...face];
      face[0] = temp[6]; face[1] = temp[3]; face[2] = temp[0];
      face[3] = temp[7]; face[4] = temp[4]; face[5] = temp[1];
      face[6] = temp[8]; face[7] = temp[5]; face[8] = temp[2];
    } else {
      // Rotate face 90 degrees counter-clockwise
      const temp = [...face];
      face[0] = temp[2]; face[1] = temp[5]; face[2] = temp[8];
      face[3] = temp[1]; face[4] = temp[4]; face[5] = temp[7];
      face[6] = temp[0]; face[7] = temp[3]; face[8] = temp[6];
    }
  }

  private rotateRightFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      // Rotate the right face itself
      this.rotateFace(state.right!, clockwise);
      
      // Rotate adjacent edges
      if (state.front && state.top && state.back && state.bottom) {
        const temp = [state.front[2], state.front[5], state.front[8]];
        
        if (clockwise) {
          state.front[2] = state.bottom[2];
          state.front[5] = state.bottom[5];
          state.front[8] = state.bottom[8];
          
          state.bottom[2] = state.back[6];
          state.bottom[5] = state.back[3];
          state.bottom[8] = state.back[0];
          
          state.back[6] = state.top[2];
          state.back[3] = state.top[5];
          state.back[0] = state.top[8];
          
          state.top[2] = temp[0];
          state.top[5] = temp[1];
          state.top[8] = temp[2];
        } else {
          state.front[2] = state.top[2];
          state.front[5] = state.top[5];
          state.front[8] = state.top[8];
          
          state.top[2] = state.back[6];
          state.top[5] = state.back[3];
          state.top[8] = state.back[0];
          
          state.back[6] = state.bottom[2];
          state.back[3] = state.bottom[5];
          state.back[0] = state.bottom[8];
          
          state.bottom[2] = temp[0];
          state.bottom[5] = temp[1];
          state.bottom[8] = temp[2];
        }
      }
    }
  }

  private rotateLeftFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      this.rotateFace(state.left!, clockwise);
      
      if (state.front && state.top && state.back && state.bottom) {
        const temp = [state.front[0], state.front[3], state.front[6]];
        
        if (clockwise) {
          state.front[0] = state.top[0];
          state.front[3] = state.top[3];
          state.front[6] = state.top[6];
          
          state.top[0] = state.back[8];
          state.top[3] = state.back[5];
          state.top[6] = state.back[2];
          
          state.back[8] = state.bottom[0];
          state.back[5] = state.bottom[3];
          state.back[2] = state.bottom[6];
          
          state.bottom[0] = temp[0];
          state.bottom[3] = temp[1];
          state.bottom[6] = temp[2];
        }
      }
    }
  }

  private rotateTopFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      this.rotateFace(state.top!, clockwise);
      
      if (state.front && state.left && state.back && state.right) {
        const temp = [state.front[0], state.front[1], state.front[2]];
        
        if (clockwise) {
          state.front[0] = state.right[0];
          state.front[1] = state.right[1];
          state.front[2] = state.right[2];
          
          state.right[0] = state.back[0];
          state.right[1] = state.back[1];
          state.right[2] = state.back[2];
          
          state.back[0] = state.left[0];
          state.back[1] = state.left[1];
          state.back[2] = state.left[2];
          
          state.left[0] = temp[0];
          state.left[1] = temp[1];
          state.left[2] = temp[2];
        }
      }
    }
  }

  private rotateBottomFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      this.rotateFace(state.bottom!, clockwise);
      
      if (state.front && state.left && state.back && state.right) {
        const temp = [state.front[6], state.front[7], state.front[8]];
        
        if (clockwise) {
          state.front[6] = state.left[6];
          state.front[7] = state.left[7];
          state.front[8] = state.left[8];
          
          state.left[6] = state.back[6];
          state.left[7] = state.back[7];
          state.left[8] = state.back[8];
          
          state.back[6] = state.right[6];
          state.back[7] = state.right[7];
          state.back[8] = state.right[8];
          
          state.right[6] = temp[0];
          state.right[7] = temp[1];
          state.right[8] = temp[2];
        }
      }
    }
  }

  private rotateFrontFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      this.rotateFace(state.front!, clockwise);
      
      if (state.top && state.left && state.bottom && state.right) {
        const temp = [state.top[6], state.top[7], state.top[8]];
        
        if (clockwise) {
          state.top[6] = state.left[8];
          state.top[7] = state.left[5];
          state.top[8] = state.left[2];
          
          state.left[8] = state.bottom[2];
          state.left[5] = state.bottom[1];
          state.left[2] = state.bottom[0];
          
          state.bottom[2] = state.right[0];
          state.bottom[1] = state.right[3];
          state.bottom[0] = state.right[6];
          
          state.right[0] = temp[0];
          state.right[3] = temp[1];
          state.right[6] = temp[2];
        }
      }
    }
  }

  private rotateBackFace(state: CubeColors, rotation: number) {
    const clockwise = rotation > 0;
    const times = Math.abs(rotation);
    
    for (let i = 0; i < times; i++) {
      this.rotateFace(state.back!, clockwise);
      
      if (state.top && state.left && state.bottom && state.right) {
        const temp = [state.top[0], state.top[1], state.top[2]];
        
        if (clockwise) {
          state.top[0] = state.right[2];
          state.top[1] = state.right[5];
          state.top[2] = state.right[8];
          
          state.right[2] = state.bottom[8];
          state.right[5] = state.bottom[7];
          state.right[8] = state.bottom[6];
          
          state.bottom[8] = state.left[6];
          state.bottom[7] = state.left[3];
          state.bottom[6] = state.left[0];
          
          state.left[6] = temp[0];
          state.left[3] = temp[1];
          state.left[0] = temp[2];
        }
      }
    }
  }
}