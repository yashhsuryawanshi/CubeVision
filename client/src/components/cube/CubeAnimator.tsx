import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import * as THREE from "three";
import { Move } from "../../lib/cubeUtils";

interface CubeAnimatorProps {
  faceColors: any;
  currentMove?: Move | null;
  isAnimating: boolean;
  animationSpeed: number;
  onAnimationComplete: () => void;
  highlightLayer?: string | null;
}

interface CubeFaceProps {
  colors: string[];
  position: [number, number, number];
  rotation: [number, number, number];
  isHighlighted?: boolean;
}

function CubeFace({ colors, position, rotation, isHighlighted }: CubeFaceProps) {
  const groupRef = useRef<Group>(null);
  const faceSize = 1;
  const squareSize = faceSize / 3;

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

  // Pulse effect for highlighted faces
  useFrame(({ clock }) => {
    if (groupRef.current && isHighlighted) {
      const pulse = Math.sin(clock.elapsedTime * 4) * 0.1 + 1;
      groupRef.current.scale.setScalar(pulse);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {colors.map((color, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * squareSize;
        const y = (1 - row) * squareSize;
        
        return (
          <mesh key={index} position={[x, y, 0.01]}>
            <planeGeometry args={[squareSize * 0.95, squareSize * 0.95]} />
            <meshLambertMaterial 
              color={getColorHex(color)} 
              transparent={isHighlighted}
              opacity={isHighlighted ? 0.8 : 1.0}
            />
          </mesh>
        );
      })}
      
      {/* Face border */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[faceSize, faceSize]} />
        <meshBasicMaterial 
          color={isHighlighted ? "#ffff00" : "#222222"} 
          transparent={isHighlighted}
          opacity={isHighlighted ? 0.3 : 1.0}
        />
      </mesh>
      
      {/* Highlight outline */}
      {isHighlighted && (
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[faceSize * 0.45, faceSize * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

export default function CubeAnimator({ 
  faceColors, 
  currentMove, 
  isAnimating, 
  animationSpeed, 
  onAnimationComplete,
  highlightLayer 
}: CubeAnimatorProps) {
  const cubeGroupRef = useRef<Group>(null);
  const animationProgressRef = useRef(0);
  const lastMoveRef = useRef<Move | null>(null);

  // Reset animation when new move starts
  useEffect(() => {
    if (currentMove && currentMove !== lastMoveRef.current) {
      animationProgressRef.current = 0;
      lastMoveRef.current = currentMove;
    }
  }, [currentMove]);

  useFrame((state, delta) => {
    if (!cubeGroupRef.current || !isAnimating || !currentMove) return;

    // Calculate animation progress
    const speed = animationSpeed * delta * 2; // Adjust speed multiplier as needed
    animationProgressRef.current += speed;

    if (animationProgressRef.current >= 1) {
      animationProgressRef.current = 1;
      // Complete the animation
      setTimeout(() => {
        onAnimationComplete();
      }, 50);
    }

    // Apply rotation based on current move
    const targetRotation = getTargetRotation(currentMove);
    const currentRotation = targetRotation * animationProgressRef.current;
    
    // Apply rotation to the appropriate axis
    if (currentMove.face === 'R' || currentMove.face === 'L') {
      cubeGroupRef.current.rotation.x = currentRotation;
    } else if (currentMove.face === 'U' || currentMove.face === 'D') {
      cubeGroupRef.current.rotation.y = currentRotation;
    } else if (currentMove.face === 'F' || currentMove.face === 'B') {
      cubeGroupRef.current.rotation.z = currentRotation;
    }
  });

  const getTargetRotation = (move: Move): number => {
    const baseRotation = (Math.PI / 2) * move.rotation; // 90 degrees * rotation count
    
    // Adjust direction based on face
    if (move.face === 'L' || move.face === 'D' || move.face === 'B') {
      return -baseRotation;
    }
    return baseRotation;
  };

  const getHighlightedFace = (): string | null => {
    if (currentMove) {
      return currentMove.face;
    }
    return highlightLayer || null;
  };

  const faces = [
    { 
      name: 'front', 
      colors: faceColors.front || Array(9).fill('white'), 
      position: [0, 0, 0.5] as [number, number, number], 
      rotation: [0, 0, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'F'
    },
    { 
      name: 'back', 
      colors: faceColors.back || Array(9).fill('white'), 
      position: [0, 0, -0.5] as [number, number, number], 
      rotation: [0, Math.PI, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'B'
    },
    { 
      name: 'right', 
      colors: faceColors.right || Array(9).fill('white'), 
      position: [0.5, 0, 0] as [number, number, number], 
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'R'
    },
    { 
      name: 'left', 
      colors: faceColors.left || Array(9).fill('white'), 
      position: [-0.5, 0, 0] as [number, number, number], 
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'L'
    },
    { 
      name: 'top', 
      colors: faceColors.top || Array(9).fill('white'), 
      position: [0, 0.5, 0] as [number, number, number], 
      rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'U'
    },
    { 
      name: 'bottom', 
      colors: faceColors.bottom || Array(9).fill('white'), 
      position: [0, -0.5, 0] as [number, number, number], 
      rotation: [Math.PI / 2, 0, 0] as [number, number, number],
      isHighlighted: getHighlightedFace() === 'D'
    },
  ];

  return (
    <group ref={cubeGroupRef}>
      {faces.map((face) => (
        <CubeFace 
          key={face.name}
          colors={face.colors}
          position={face.position}
          rotation={face.rotation}
          isHighlighted={face.isHighlighted}
        />
      ))}
    </group>
  );
}