import { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { Group } from 'three';

interface SieveModelProps {
  selectedLevel: number;
}

type Hole = {
  position: [number, number, number];
  radius: number;
};

const holeDataByLevel: Record<number, Hole[]> = {
  0: [
    { position: [0, 0, 0.4], radius: 0.43 },
    { position: [0.03, 0, -0.6], radius: 0.43 },
    { position: [0.67, 0, -0.15], radius: 0.43 },
    { position: [-0.67, 0, -0.15], radius: 0.43},

    { position: [-0.7, 0, 0.5], radius: 0.2 },
    { position: [-0.7, 0, -0.75], radius: 0.3 },
    { position: [0.7, 0, -0.8], radius: 0.2 },
    { position: [0.7, 0, 0.5], radius: 0.3 },

    { position: [0, 0, 1.4], radius: 0.43 },
    { position: [-1.2, 0, -1.2], radius: 0.43 },
    { position: [-1.5, 0, 0], radius: 0.43 },
    { position: [-1.2, 0, 0.9], radius: 0.43 },
    { position: [0, 0, -1.5], radius: 0.43 },
    { position: [1.2, 0, -1.2], radius: 0.43 },
    { position: [1.6, 0, -0.2], radius: 0.43 },
    { position: [1.2, 0, 1.1], radius: 0.43 },
    
    { position: [0, 0, 2.4], radius: 0.45 },
    { position: [1.1, 0, 2.2], radius: 0.45 },
    { position: [1.9, 0, 1.7], radius: 0.45 },
    { position: [2.3, 0, 0.8], radius: 0.45 },
    { position: [2.5, 0, -0.1], radius: 0.45 },
    { position: [2.3, 0, -1.1], radius: 0.45 },
    { position: [1.7, 0, -1.7], radius: 0.45 },
    { position: [0.9, 0, -2.2], radius: 0.45 },
    { position: [0, 0, -2.4], radius: 0.45 },
    { position: [-0.9, 0, -2.2], radius: 0.45 },
    { position: [-1.7, 0, -1.9], radius: 0.45 },
    { position: [-2.3, 0, -1.1], radius: 0.45 },
    { position: [-2.4, 0, 0], radius: 0.45 },
    { position: [-2.2, 0, 0.8], radius: 0.45 },
    { position: [-1.9, 0, 1.6], radius: 0.45 },
    { position: [-0.9, 0, 2.2], radius: 0.45 },
  ],
  1: [], // 막힘
  2: [
    { position: [0, 0, 0], radius: 0.2 },
    { position: [0, 0, 0.75], radius: 0.2 },
    { position: [0, 0, 1.5], radius: 0.2 },
    { position: [0, 0, -0.75], radius: 0.2 },
    { position: [0, 0, -1.5], radius: 0.2 },
    { position: [0.75, 0, 0], radius: 0.2 },
    { position: [1.5, 0, 0], radius: 0.2 },
    { position: [-0.75, 0, 0], radius: 0.2 },
    { position: [-1.5, 0, 0], radius: 0.2 },
    { position: [0.75, 0, 0.75], radius: 0.2 },
    { position: [0.75, 0, 1.5], radius: 0.2 },
    { position: [1.5, 0, 1.5], radius: 0.2 },
    { position: [1.5, 0, 0.75], radius: 0.2 },
    { position: [-0.75, 0, 0.75], radius: 0.2 },
    { position: [-0.75, 0, 1.5], radius: 0.2 },
    { position: [-1.5, 0, 1.5], radius: 0.2 },
    { position: [-1.5, 0, 0.75], radius: 0.2 },
    { position: [-0.75, 0, -0.75], radius: 0.2 },
    { position: [-0.75, 0, -1.5], radius: 0.2 },
    { position: [-1.5, 0, -1.5], radius: 0.2 },
    { position: [-1.5, 0, -0.75], radius: 0.2 },
    { position: [0.75, 0, -0.75], radius: 0.2 },
    { position: [0.75, 0, -1.5], radius: 0.2 },
    { position: [1.5, 0, -1.5], radius: 0.2 },
    { position: [1.5, 0, -0.75], radius: 0.2 },
  ],
};

// 구멍 시각화 컴포넌트
function HoleVisual({ position, radius }: Hole) {
  return (
    <mesh position={[position[0], -0.6, position[2]]}>
      <cylinderGeometry args={[radius, radius, 0.1, 32]} />
      <meshStandardMaterial color="red" transparent opacity={0.4} />
    </mesh>
  );
}

// 개별 충돌 셀 컴포넌트
function SolidCell({ position }: { position: [number, number, number] }) {
  const ref = useRef(null);
  useBox(() => ({
    type: 'Static',
    args: [0.3 * 0.95, 0.05, 0.3 * 0.95],
    position,
    friction: 0.1,
  }), ref);
  
  return null;
}



// 외벽 세그먼트 컴포넌트
function WallSegment({ index, segments, radius, height, thickness }: { 
  index: number;
  segments: number;
  radius: number;
  height: number;
  thickness: number;
}) {
  const ref = useRef(null);
  const angle = (index / segments) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const rotation: [number, number, number] = [0, -angle, 0];
  
  useBox(() => ({
    type: 'Static',
    args: [thickness, height, (2 * Math.PI * radius) / segments],
    position: [x, height / 2, z],
    rotation,
  }), ref);
  
  return (
    <mesh key={index} ref={ref} position={[x, height / 2, z]} rotation={rotation}>
      <boxGeometry args={[thickness, height, (2 * Math.PI * radius) / segments]} />
      <meshStandardMaterial wireframe color="white" transparent opacity={0.0} />
    </mesh>
  );
}

// 외벽 컴포넌트
function CurvedWallCollider() {
  const segments = 32;
  const radius = 3.0;
  const height = 5;
  const thickness = 0.15;
  
  // 세그먼트 수에 맞게 인덱스 배열 생성
  const indices = useMemo(() => Array.from({ length: segments }, (_, i) => i), []);
  
  return (
    <>
      {indices.map((index) => (
        <WallSegment 
          key={index} 
          index={index} 
          segments={segments} 
          radius={radius} 
          height={height} 
          thickness={thickness} 
        />
      ))}
    </>
  );
}

// 체의 물리 구조 생성 컴포넌트
function SievePhysics({ selectedLevel }: { selectedLevel: number }) {
  // Grid positions 계산
  const gridCells = useMemo(() => {
    const cells: { position: [number, number, number]; key: string }[] = [];
    const gridSize = 3.0;
    const spacing = 0.3;
    const holes = holeDataByLevel[selectedLevel];
    
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        const pos: [number, number, number] = [x, -0.2, z];
        
        const isHole = holes.some(hole => {
          const dx = hole.position[0] - pos[0];
          const dz = hole.position[2] - pos[2];
          const distance = Math.sqrt(dx * dx + dz * dz);
          return distance < hole.radius;
        });
        
        if (!isHole) {
          cells.push({
            position: pos,
            key: `${x.toFixed(2)}-${z.toFixed(2)}`
          });
        }
      }
    }
    
    return cells;
  }, [selectedLevel]);

  return (
    <>
      {gridCells.map((cell) => (
        <SolidCell key={cell.key} position={cell.position} />
      ))}
    </>
  );
}

export default function SieveModel({ selectedLevel }: SieveModelProps) {
  const visualRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/material/Streinergltf.gltf');
  const mesh = scene.children[selectedLevel]?.clone();
  const holes = holeDataByLevel[selectedLevel];

  return (
    <>
      {mesh && (
        <primitive 
          object={mesh} 
          ref={visualRef} 
          position={[0, -0.7, 4.9]} 
          scale={0.22} 
        />
      )}

      <SievePhysics selectedLevel={selectedLevel} />

      {holes.map((hole, i) => (
        <HoleVisual key={`hole-${i}`} position={hole.position} radius={hole.radius} />
      ))}

      <CurvedWallCollider />
    </>
  );
}