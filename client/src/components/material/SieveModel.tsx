import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox, useCylinder } from '@react-three/cannon';
import { Group } from 'three';

const holePositionsByLevel: Record<number, [number, number, number][]> = {
  0: [[-1.5, 0, -1.5], [0, 0, -1.5], [1.5, 0, -1.5], [-1.5, 0, 0], [0, 0, 0], [1.5, 0, 0], [-1.5, 0, 1.5], [0, 0, 1.5], [1.5, 0, 1.5]],
  1: [[-1.5, 0, -1.5], [0, 0, 0], [1.5, 0, 1.5]],
  2: [[0, 0, 0], [0, 0, 0.9], [0, 0, 1.8], [0, 0, -0.9], [0, 0, -1.8],
      [0.9, 0, 0], [0.9, 0, 0.9], [0.9, 0, 1.8], [0.9, 0, -0.9], [0.9, 0, -1.8],
      [-0.9, 0, 0], [-0.9, 0, 0.9], [-0.9, 0, 1.8], [-0.9, 0, -0.9], [-0.9, 0, -1.8],
      [1.8, 0, 0], [1.8, 0, 0.9], [1.8, 0, 1.8], [1.8, 0, -0.9], [1.8, 0, -1.8],
      [-1.8, 0, 0], [-1.8, 0, 0.9], [-1.8, 0, 1.8], [-1.8, 0, -0.9], [-1.8, 0, -1.8]

],
};

const gridSize = 7.0;
const spacing = 0.9;

function SolidCell({ position }: { position: [number, number, number] }) {
  const ref = useRef(null);
  useBox(() => ({
    type: 'Static',
    args: [spacing - 0.1, 0.1, spacing - 0.1],
    position,
  }), ref);
  return null;
}

function HoleVisual({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
      <meshStandardMaterial color="red" transparent opacity={0.3} />
    </mesh>
  );
}


export default function SieveModel({ selectedLevel }: { selectedLevel: number }) {
  const visualRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/material/Streinergltf.gltf');
  const mesh = scene.children[selectedLevel]?.clone();
  const holePositions = holePositionsByLevel[selectedLevel];

  // 🔄 전체 격자 기반 바닥 생성
  const solidCells: [number, number, number][] = [];

  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const pos: [number, number, number] = [i * spacing, 0, j * spacing];
      const isHole = holePositions.some(([x, y, z]) => (
        Math.abs(x - pos[0]) < 0.1 && Math.abs(z - pos[2]) < 0.1
      ));
      if (!isHole) solidCells.push(pos);
    }
  }

  // 🔄 옆면 벽 rigid body
  const wallRef = useRef(null);
  useCylinder(() => ({
    type: 'Static',
    args: [3.2, 3.2, 70.5, 32],
    position: [0, 0.75, 0],
  }), wallRef);

  

  return (
    <>
      {mesh && <primitive object={mesh} ref={visualRef} position={[0, 0, 5.6]} scale={0.25} />}

      {/* 구멍 제외 나머지 부분에 collider 생성 */}
      {solidCells.map((pos, i) => (
        <SolidCell key={i} position={pos} />
      ))}

      {holePositions.map((pos, i) => (
        <HoleVisual key={`hole-${i}`} position={pos} />
      ))}

      <mesh ref={wallRef} visible={true}>
        <cylinderGeometry args={[3.3, 3.3, 7.5, 32]} />
        <meshStandardMaterial wireframe color="red" />
      </mesh>
    </>
  );
}
