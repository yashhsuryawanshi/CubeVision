import { CubeColors } from "./stores/useCube";

// Cube solving utilities and algorithms

export interface Move {
  face: 'R' | 'L' | 'U' | 'D' | 'F' | 'B';
  rotation: 1 | 2 | 3; // 1 = 90°, 2 = 180°, 3 = 270° (same as -90°)
}

export interface Algorithm {
  name: string;
  moves: Move[];
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Common algorithms for solving
export const ALGORITHMS: Record<string, Algorithm> = {
  'right-hand': {
    name: 'Right Hand Algorithm',
    moves: [
      { face: 'R', rotation: 1 },
      { face: 'U', rotation: 1 },
      { face: 'R', rotation: 3 }, // R'
      { face: 'U', rotation: 3 }  // U'
    ],
    description: 'Basic algorithm for positioning corner pieces',
    difficulty: 'Easy'
  },
  
  'sexy-move': {
    name: 'Sexy Move',
    moves: [
      { face: 'R', rotation: 1 },
      { face: 'U', rotation: 1 },
      { face: 'R', rotation: 3 }, // R'
      { face: 'F', rotation: 1 },
      { face: 'R', rotation: 1 },
      { face: 'F', rotation: 3 }  // F'
    ],
    description: 'Useful for orienting corners in the last layer',
    difficulty: 'Medium'
  },

  'sune': {
    name: 'Sune',
    moves: [
      { face: 'R', rotation: 1 },
      { face: 'U', rotation: 1 },
      { face: 'R', rotation: 3 }, // R'
      { face: 'U', rotation: 1 },
      { face: 'R', rotation: 1 },
      { face: 'U', rotation: 2 },  // U2
      { face: 'R', rotation: 3 }   // R'
    ],
    description: 'Orients yellow corners when you see a "fish" pattern',
    difficulty: 'Medium'
  },

  'y-perm': {
    name: 'Y Permutation',
    moves: [
      { face: 'R', rotation: 3 }, // R'
      { face: 'F', rotation: 1 },
      { face: 'R', rotation: 3 }, // R'
      { face: 'B', rotation: 2 },  // B2
      { face: 'R', rotation: 1 },
      { face: 'F', rotation: 3 }, // F'
      { face: 'R', rotation: 3 }, // R'
      { face: 'B', rotation: 2 },  // B2
      { face: 'R', rotation: 2 }   // R2
    ],
    description: 'Cycles three corners in the final step',
    difficulty: 'Hard'
  }
};

// Convert algorithm to readable notation
export function algorithmToNotation(algorithm: Algorithm): string {
  return algorithm.moves.map(move => {
    if (move.rotation === 1) return move.face;
    if (move.rotation === 2) return `${move.face}2`;
    if (move.rotation === 3) return `${move.face}'`;
    return move.face;
  }).join(' ');
}

// Parse notation string to moves
export function parseNotation(notation: string): Move[] {
  const tokens = notation.split(' ').filter(token => token.trim());
  const moves: Move[] = [];

  tokens.forEach(token => {
    const face = token[0] as Move['face'];
    let rotation: Move['rotation'] = 1;

    if (token.includes('2')) {
      rotation = 2;
    } else if (token.includes("'")) {
      rotation = 3;
    }

    if (['R', 'L', 'U', 'D', 'F', 'B'].includes(face)) {
      moves.push({ face, rotation });
    }
  });

  return moves;
}

// Check if cube is solved
export function isCubeSolved(faceColors: CubeColors): boolean {
  const faces: (keyof CubeColors)[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  
  return faces.every(face => {
    const colors = faceColors[face];
    if (!colors || colors.length !== 9) return false;
    
    // All squares on a face should be the same color
    const firstColor = colors[0];
    return colors.every(color => color === firstColor);
  });
}

// Get cube state summary
export function getCubeStateSummary(faceColors: CubeColors): {
  completedFaces: number;
  totalColors: Record<string, number>;
  isValidState: boolean;
} {
  const faces: (keyof CubeColors)[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  let completedFaces = 0;
  const totalColors: Record<string, number> = {};

  faces.forEach(face => {
    const colors = faceColors[face];
    if (!colors) return;

    // Check if face is completed (all same color)
    const firstColor = colors[0];
    if (colors.every(color => color === firstColor)) {
      completedFaces++;
    }

    // Count colors
    colors.forEach(color => {
      totalColors[color] = (totalColors[color] || 0) + 1;
    });
  });

  // Validate that each color appears exactly 9 times
  const standardColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
  const isValidState = standardColors.every(color => totalColors[color] === 9);

  return {
    completedFaces,
    totalColors,
    isValidState
  };
}

// Generate scramble sequence
export function generateScramble(length: number = 20): string {
  const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(face + modifier);
    lastFace = face;
  }

  return scramble.join(' ');
}

// Calculate solving difficulty based on cube state
export function calculateDifficulty(faceColors: CubeColors): {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedMoves: number;
  recommendation: string;
} {
  const summary = getCubeStateSummary(faceColors);
  
  if (summary.completedFaces >= 5) {
    return {
      level: 'Beginner',
      estimatedMoves: 5,
      recommendation: 'Your cube is almost solved! Just a few moves needed.'
    };
  }
  
  if (summary.completedFaces >= 3) {
    return {
      level: 'Intermediate', 
      estimatedMoves: 15,
      recommendation: 'Good progress! Focus on the remaining layers.'
    };
  }
  
  if (summary.completedFaces >= 1) {
    return {
      level: 'Advanced',
      estimatedMoves: 35,
      recommendation: 'This will take some work. Follow the layer-by-layer method.'
    };
  }

  return {
    level: 'Expert',
    estimatedMoves: 50,
    recommendation: 'Completely scrambled cube. Start with the white cross method.'
  };
}

// Validate move sequence
export function validateMoveSequence(moves: Move[]): boolean {
  // Basic validation - no more than 3 consecutive moves of the same face
  for (let i = 0; i < moves.length - 2; i++) {
    if (moves[i].face === moves[i + 1].face && moves[i + 1].face === moves[i + 2].face) {
      return false;
    }
  }
  return true;
}

// Optimize move sequence (remove redundant moves)
export function optimizeMoves(moves: Move[]): Move[] {
  const optimized: Move[] = [];
  
  for (let i = 0; i < moves.length; i++) {
    const current = moves[i];
    let totalRotation = current.rotation;
    let j = i + 1;
    
    // Combine consecutive moves of the same face
    while (j < moves.length && moves[j].face === current.face) {
      totalRotation += moves[j].rotation;
      j++;
    }
    
    // Normalize rotation (mod 4)
    totalRotation = totalRotation % 4;
    
    // Only add the move if it's not a full rotation (4 steps = no move)
    if (totalRotation !== 0) {
      optimized.push({
        face: current.face,
        rotation: totalRotation as Move['rotation']
      });
    }
    
    // Skip the moves we've combined
    i = j - 1;
  }
  
  return optimized;
}
