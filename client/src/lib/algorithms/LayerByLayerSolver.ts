import { CubeColors } from "../stores/useCube";
import { Move, parseNotation } from "../cubeUtils";

export interface Algorithm {
  name: string;
  description: string;
  moves: string;
  purpose: string;
}

// Standard beginner algorithms for layer-by-layer solving
export const BEGINNER_ALGORITHMS: Record<string, Algorithm> = {
  // White Cross
  'RIGHT_HAND_TRIGGER': {
    name: "Right Hand Trigger",
    description: "Basic right-hand algorithm for positioning edges",
    moves: "R U R' U'",
    purpose: "Move edge pieces into position without disturbing solved pieces"
  },
  
  'WHITE_CROSS_FLIP': {
    name: "White Cross Edge Flip",
    description: "Flip edge piece to show white on bottom",
    moves: "F R U R' U' F'",
    purpose: "Orient white edge pieces correctly in the bottom cross"
  },

  // White Corners
  'RIGHT_CORNER_INSERT': {
    name: "Right Corner Insert",
    description: "Insert corner piece from top layer to bottom right",
    moves: "R' D' R D",
    purpose: "Position white corner pieces in the bottom layer"
  },

  'CORNER_ORIENT': {
    name: "Corner Orientation",
    description: "Rotate corner piece to show white on bottom",
    moves: "R D R' D' R D R' D'",
    purpose: "Orient white corner pieces correctly"
  },

  // Second Layer
  'RIGHT_EDGE_INSERT': {
    name: "Right Edge Insert", 
    description: "Insert edge piece to the right side of middle layer",
    moves: "U R U' R' U' F' U F",
    purpose: "Place middle layer edge pieces on the right side"
  },

  'LEFT_EDGE_INSERT': {
    name: "Left Edge Insert",
    description: "Insert edge piece to the left side of middle layer", 
    moves: "U' L' U L U F U' F'",
    purpose: "Place middle layer edge pieces on the left side"
  },

  // OLL (Orientation of Last Layer)
  'OLL_CROSS': {
    name: "OLL Cross (FRUR'U'F')",
    description: "Create yellow cross on top face",
    moves: "F R U R' U' F'",
    purpose: "Orient top layer edges to form yellow cross"
  },

  'OLL_SUNE': {
    name: "Sune Algorithm",
    description: "Orient yellow corners (right hand)",
    moves: "R U R' U R U2 R'",
    purpose: "Orient yellow corner pieces on top face"
  },

  'OLL_ANTI_SUNE': {
    name: "Anti-Sune Algorithm", 
    description: "Orient yellow corners (left hand)",
    moves: "L' U' L U' L' U2 L",
    purpose: "Orient yellow corner pieces (mirror of Sune)"
  },

  // PLL (Permutation of Last Layer)
  'PLL_T_PERM': {
    name: "T-Perm",
    description: "Swap two adjacent edges",
    moves: "R U R' F' R U R' U' R' F R2 U' R'",
    purpose: "Permute top layer edges - swap two adjacent edges"
  },

  'PLL_Y_PERM': {
    name: "Y-Perm", 
    description: "Cycle three corners diagonally",
    moves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    purpose: "Permute top layer corners - cycle three corners"
  },

  'PLL_A_PERM': {
    name: "A-Perm",
    description: "Cycle three corners clockwise",
    moves: "R' F R' B2 R F' R' B2 R2",
    purpose: "Permute top layer corners - three-corner cycle"
  },

  'PLL_U_PERM': {
    name: "U-Perm",
    description: "Swap two opposite edges",
    moves: "R2 U' R' U' R U R U R U' R",
    purpose: "Permute top layer edges - swap opposite edges"
  }
};

// Step-by-step layer-by-layer solution
export class LayerByLayerSolver {
  private cubeState: CubeColors;
  
  constructor(cubeState: CubeColors) {
    this.cubeState = cubeState;
  }

  generateSolution(): { steps: any[], totalMoves: number, method: 'beginner', estimatedTime: string } {
    const steps = [
      {
        id: 1,
        name: "White Cross",
        description: "Form a white cross on the bottom layer with matching edge colors",
        algorithms: ['WHITE_CROSS_FLIP', 'RIGHT_HAND_TRIGGER'],
        explanation: `
          Look for white edge pieces and position them to form a cross on the bottom (white) face.
          
          Key points:
          • Each edge must match its center color
          • Use F R U R' U' F' to flip edges
          • Use setup moves to position edges correctly
          
          The goal is to have all four white edge pieces on the bottom face forming a cross pattern.
        `,
        moves: this.generateWhiteCrossMoves()
      },
      {
        id: 2,
        name: "White Corners",
        description: "Complete the white face by positioning all white corner pieces",
        algorithms: ['RIGHT_CORNER_INSERT', 'CORNER_ORIENT'],
        explanation: `
          Find white corner pieces and position them in the bottom layer.
          
          Process:
          1. Find a white corner in the top layer
          2. Position it above its target location
          3. Use R' D' R D to insert it
          4. If the white sticker is not on the bottom, repeat the algorithm
          
          The white face should be completely solved after this step.
        `,
        moves: this.generateWhiteCornerMoves()
      },
      {
        id: 3,
        name: "Middle Layer Edges",
        description: "Position the second layer edge pieces without disturbing the white face",
        algorithms: ['RIGHT_EDGE_INSERT', 'LEFT_EDGE_INSERT'],
        explanation: `
          Solve the middle layer by positioning edge pieces that don't contain yellow.
          
          Right-hand algorithm (edge goes right): U R U' R' U' F' U F
          Left-hand algorithm (edge goes left): U' L' U L U F U' F'
          
          Process:
          1. Find an edge piece in the top layer without yellow
          2. Position it above its target location
          3. Determine if it goes right or left
          4. Apply the appropriate algorithm
        `,
        moves: this.generateMiddleLayerMoves()
      },
      {
        id: 4,
        name: "Yellow Cross (OLL)",
        description: "Create a yellow cross on the top face",
        algorithms: ['OLL_CROSS'],
        explanation: `
          Orient the top layer edges to form a yellow cross.
          
          Patterns you might see:
          • Dot: No yellow edges showing - apply algorithm
          • Line: Two opposite edges showing - hold line horizontally, apply algorithm  
          • L-shape: Adjacent edges showing - position L in bottom-left, apply algorithm
          • Cross: All edges showing yellow - you're done!
          
          Algorithm: F R U R' U' F'
          Repeat until you see a yellow cross.
        `,
        moves: this.generateYellowCrossMoves()
      },
      {
        id: 5,
        name: "Orient Yellow Corners (OLL)",
        description: "Make all top face corners show yellow",
        algorithms: ['OLL_SUNE', 'OLL_ANTI_SUNE'],
        explanation: `
          Orient yellow corners to show yellow on top.
          
          Sune algorithm: R U R' U R U2 R'
          Anti-Sune: L' U' L U' L' U2 L
          
          Process:
          1. Hold cube with correctly oriented corner in bottom-right
          2. Apply Sune or Anti-Sune depending on pattern
          3. Repeat until all corners show yellow on top
          
          You might need to apply the algorithm 1-3 times.
        `,
        moves: this.generateYellowCornerOrientMoves()
      },
      {
        id: 6,
        name: "Position Yellow Corners (PLL)",
        description: "Move yellow corners to their correct positions", 
        algorithms: ['PLL_Y_PERM', 'PLL_A_PERM'],
        explanation: `
          Position corners in their correct locations.
          
          Y-Perm: F R U' R' U' R U R' F' R U R' U' R' F R F'
          A-Perm: R' F R' B2 R F' R' B2 R2
          
          Process:
          1. Find corners that are already in correct positions
          2. Hold cube so these corners are in back
          3. Apply Y-Perm to cycle the three front corners
          4. Repeat if necessary
        `,
        moves: this.generateYellowCornerPermuteMoves()
      },
      {
        id: 7,
        name: "Position Yellow Edges (PLL)",
        description: "Complete the cube by positioning the final edges",
        algorithms: ['PLL_T_PERM', 'PLL_U_PERM'],
        explanation: `
          Position the final edges to complete the solve.
          
          T-Perm: R U R' F' R U R' U' R' F R2 U' R'
          U-Perm: R2 U' R' U' R U R U R U' R
          
          Process:
          1. Find the edge that's already in the correct position
          2. Hold that edge in the back
          3. Apply T-Perm to swap the front two edges
          4. If no edges are correct, apply any PLL to create one correct edge
          
          The cube should now be completely solved!
        `,
        moves: this.generateYellowEdgePermuteMoves()
      }
    ];

    return {
      steps,
      totalMoves: steps.reduce((sum, step) => sum + step.moves.length, 0),
      method: 'beginner' as const,
      estimatedTime: this.calculateEstimatedTime(steps)
    };
  }

  private generateWhiteCrossMoves(): Move[] {
    // Simplified move generation - in practice this would analyze cube state
    const algorithm = BEGINNER_ALGORITHMS.WHITE_CROSS_FLIP;
    return parseNotation(algorithm.moves);
  }

  private generateWhiteCornerMoves(): Move[] {
    const algorithm = BEGINNER_ALGORITHMS.RIGHT_CORNER_INSERT; 
    return parseNotation(algorithm.moves);
  }

  private generateMiddleLayerMoves(): Move[] {
    const rightAlg = BEGINNER_ALGORITHMS.RIGHT_EDGE_INSERT;
    const leftAlg = BEGINNER_ALGORITHMS.LEFT_EDGE_INSERT;
    // Combine both algorithms for demonstration
    return [...parseNotation(rightAlg.moves), ...parseNotation(leftAlg.moves)];
  }

  private generateYellowCrossMoves(): Move[] {
    const algorithm = BEGINNER_ALGORITHMS.OLL_CROSS;
    return parseNotation(algorithm.moves);
  }

  private generateYellowCornerOrientMoves(): Move[] {
    const algorithm = BEGINNER_ALGORITHMS.OLL_SUNE;
    return parseNotation(algorithm.moves);
  }

  private generateYellowCornerPermuteMoves(): Move[] {
    const algorithm = BEGINNER_ALGORITHMS.PLL_Y_PERM;
    return parseNotation(algorithm.moves);
  }

  private generateYellowEdgePermuteMoves(): Move[] {
    const algorithm = BEGINNER_ALGORITHMS.PLL_T_PERM;
    return parseNotation(algorithm.moves);
  }

  private calculateEstimatedTime(steps: any[]): string {
    const totalMoves = steps.reduce((sum, step) => sum + step.moves.length, 0);
    const estimatedSeconds = totalMoves * 2.5; // Beginner pace: ~2.5 seconds per move
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = Math.floor(estimatedSeconds % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}