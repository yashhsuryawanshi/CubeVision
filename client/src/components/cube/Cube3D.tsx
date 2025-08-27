import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import * as THREE from "three";
import { Move } from "../../lib/cubeUtils";

interface Cube3DProps {
  faceColors: any;
  currentMove?: Move | null;
  isAnimating: boolean;
  animationSpeed: number;
  onAnimationComplete: () => void;
  highlightLayer?: string | null;
}

// Individual cubelet component
function Cubelet({ 
  position, 
  colors, 
  isHighlighted = false 
}: { 
  position: [number, number, number]; 
  colors: { [key: string]: string }; 
  isHighlighted?: boolean;
}) {
  const meshRef = useRef<Mesh>(null);

  const getColorHex = (color: string) => {
    const colorMap: Record<string, string> = {
      'white': '#ffffff',
      'yellow': '#ffff00', 
      'red': '#ff0000',
      'orange': '#ff8000',
      'green': '#00ff00',
      'blue': '#0000ff',
    };
    return colorMap[color] || '#222222';
  };

  // Create materials for each face
  const materials = useMemo(() => {
    const faceOrder = ['right', 'left', 'top', 'bottom', 'front', 'back']; // Box geometry face order
    return faceOrder.map(face => {
      const color = colors[face] || 'black';
      const material = new THREE.MeshLambertMaterial({ 
        color: color === 'black' ? '#222222' : getColorHex(color),
        transparent: isHighlighted,
        opacity: isHighlighted ? 0.8 : 1.0
      });
      return material;
    });
  }, [colors, isHighlighted]);

  // Pulse effect for highlighted cubelets
  useFrame(({ clock }) => {
    if (meshRef.current && isHighlighted) {
      const pulse = Math.sin(clock.elapsedTime * 4) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} material={materials}>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
      </mesh>
      {isHighlighted && (
        <mesh position={position}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

export default function Cube3D({ 
  faceColors, 
  currentMove, 
  isAnimating, 
  animationSpeed, 
  onAnimationComplete,
  highlightLayer 
}: Cube3DProps) {
  const cubeGroupRef = useRef<Group>(null);
  const animationProgressRef = useRef(0);
  const lastMoveRef = useRef<Move | null>(null);

  // Auto-rotation for better view when not animating
  useFrame((state, delta) => {
    if (!cubeGroupRef.current) return;

    if (isAnimating && currentMove) {
      // Calculate animation progress
      const speed = animationSpeed * delta * 2;
      animationProgressRef.current += speed;

      if (animationProgressRef.current >= 1) {
        animationProgressRef.current = 0;
        setTimeout(() => {
          onAnimationComplete();
        }, 50);
      }

      // Apply rotation based on current move
      const targetRotation = getTargetRotation(currentMove);
      const currentRotation = targetRotation * animationProgressRef.current;
      
      // Apply rotation to the appropriate layers
      applyCubeRotation(cubeGroupRef.current, currentMove, currentRotation);
    } else if (!isAnimating) {
      // Gentle rotation when idle for better viewing
      cubeGroupRef.current.rotation.y += delta * 0.1;
      cubeGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }

    // Reset when move changes
    if (currentMove !== lastMoveRef.current) {
      animationProgressRef.current = 0;
      lastMoveRef.current = currentMove;
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

  const applyCubeRotation = (group: Group, move: Move, rotation: number) => {
    // This is a simplified rotation - in a real implementation you'd rotate specific layers
    if (move.face === 'R' || move.face === 'L') {
      group.rotation.x = rotation;
    } else if (move.face === 'U' || move.face === 'D') {
      group.rotation.y = rotation;
    } else if (move.face === 'F' || move.face === 'B') {
      group.rotation.z = rotation;
    }
  };

  // Generate 3x3x3 cube structure
  const cubelets = useMemo(() => {
    const cubelets = [];
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center cubelet (not visible)
          if (x === 0 && y === 0 && z === 0) continue;
          
          // Determine which faces are visible for this cubelet
          const colors: { [key: string]: string } = {};
          
          // Map face colors to cubelet position
          if (x === 1) { // Right face
            const gridPos = getCubeletGridPosition('right', y, z);
            colors.right = faceColors.right?.[gridPos] || 'black';
          } else {
            colors.right = 'black';
          }
          
          if (x === -1) { // Left face  
            const gridPos = getCubeletGridPosition('left', y, z);
            colors.left = faceColors.left?.[gridPos] || 'black';
          } else {
            colors.left = 'black';
          }
          
          if (y === 1) { // Top face
            const gridPos = getCubeletGridPosition('top', x, z);
            colors.top = faceColors.top?.[gridPos] || 'black';
          } else {
            colors.top = 'black';
          }
          
          if (y === -1) { // Bottom face
            const gridPos = getCubeletGridPosition('bottom', x, z);
            colors.bottom = faceColors.bottom?.[gridPos] || 'black';
          } else {
            colors.bottom = 'black';
          }
          
          if (z === 1) { // Front face
            const gridPos = getCubeletGridPosition('front', x, y);
            colors.front = faceColors.front?.[gridPos] || 'black';
          } else {
            colors.front = 'black';
          }
          
          if (z === -1) { // Back face
            const gridPos = getCubeletGridPosition('back', x, y);
            colors.back = faceColors.back?.[gridPos] || 'black';
          } else {
            colors.back = 'black';
          }

          // Determine if this cubelet should be highlighted
          const isHighlighted = shouldHighlightCubelet(x, y, z, currentMove || null, highlightLayer);
          
          cubelets.push(
            <Cubelet 
              key={`${x}-${y}-${z}`}
              position={[x, y, z]} 
              colors={colors}
              isHighlighted={isHighlighted}
            />
          );
        }
      }
    }
    
    return cubelets;
  }, [faceColors, currentMove, highlightLayer]);

  return (
    <group ref={cubeGroupRef} scale={[1.2, 1.2, 1.2]}>
      {cubelets}
      {/* Cube frame/outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3.2, 3.2, 3.2)]} />
        <lineBasicMaterial color="#333333" opacity={0.2} transparent />
      </lineSegments>
    </group>
  );
}

// Helper function to map 3D cubelet position to 2D grid position on a face
function getCubeletGridPosition(face: string, coord1: number, coord2: number): number {
  // Convert 3D coordinates (-1, 0, 1) to grid indices (0, 1, 2)
  const mapCoord = (c: number) => c + 1; // -1 -> 0, 0 -> 1, 1 -> 2
  
  let row, col;
  
  switch (face) {
    case 'front':
      col = mapCoord(coord1);  // x coordinate
      row = mapCoord(-coord2); // y coordinate (inverted)
      break;
    case 'back':
      col = mapCoord(-coord1); // x coordinate (mirrored)
      row = mapCoord(-coord2); // y coordinate (inverted)
      break;
    case 'right':
      col = mapCoord(-coord2); // z coordinate (mirrored)
      row = mapCoord(-coord1); // y coordinate (inverted)
      break;
    case 'left':
      col = mapCoord(coord2);  // z coordinate
      row = mapCoord(-coord1); // y coordinate (inverted)
      break;
    case 'top':
      col = mapCoord(coord1);  // x coordinate
      row = mapCoord(coord2);  // z coordinate
      break;
    case 'bottom':
      col = mapCoord(coord1);  // x coordinate
      row = mapCoord(-coord2); // z coordinate (inverted)
      break;
    default:
      row = 0;
      col = 0;
  }
  
  // Convert row,col to grid index (0-8)
  return row * 3 + col;
}

// Helper function to determine if a cubelet should be highlighted
function shouldHighlightCubelet(
  x: number, 
  y: number, 
  z: number, 
  currentMove: Move | null, 
  highlightLayer: string | null
): boolean {
  if (!currentMove && !highlightLayer) return false;
  
  const face = currentMove?.face || highlightLayer;
  
  switch (face) {
    case 'R':
      return x === 1;
    case 'L':
      return x === -1;
    case 'U':
      return y === 1;
    case 'D':
      return y === -1;
    case 'F':
      return z === 1;
    case 'B':
      return z === -1;
    default:
      return false;
  }
}