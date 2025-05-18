import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { Group } from 'three';

// Props 타입을 단순화 - selectedLevel만 필요
interface SieveModelProps {
  selectedLevel: number;
}

type Hole = {
  position: [number, number, number];
  radius: number;
};

// 레벨별 구멍 데이터
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
    { position: [0, 0, 0], radius: 0.18 },
    { position: [0, 0, 0.75], radius: 0.18 },
    { position: [0, 0, 1.5], radius: 0.18 },
    { position: [0, 0, -0.75], radius: 0.18 },
    { position: [0, 0, -1.5], radius: 0.18 },
    { position: [0.75, 0, 0], radius: 0.18 },
    { position: [1.5, 0, 0], radius: 0.18 },
    { position: [-0.75, 0, 0], radius: 0.18 },
    { position: [-1.5, 0, 0], radius: 0.18 },
    { position: [0.75, 0, 0.75], radius: 0.18 },
    { position: [0.75, 0, 1.5], radius: 0.18 },
    { position: [1.5, 0, 1.5], radius: 0.18 },
    { position: [1.5, 0, 0.75], radius: 0.18 },
    { position: [-0.75, 0, 0.75], radius: 0.18 },
    { position: [-0.75, 0, 1.5], radius: 0.18 },
    { position: [-1.5, 0, 1.5], radius: 0.18 },
    { position: [-1.5, 0, 0.75], radius: 0.18 },
    { position: [-0.75, 0, -0.75], radius: 0.18 },
    { position: [-0.75, 0, -1.5], radius: 0.18 },
    { position: [-1.5, 0, -1.5], radius: 0.18 },
    { position: [-1.5, 0, -0.75], radius: 0.18 },
    { position: [0.75, 0, -0.75], radius: 0.18 },
    { position: [0.75, 0, -1.5], radius: 0.18 },
    { position: [1.5, 0, -1.5], radius: 0.18 },
    { position: [1.5, 0, -0.75], radius: 0.18 },
  ],
};

// 더 조밀한 격자 구성
const gridSize = 3.0;
const spacing = 0.3; // 더 조밀한 간격

// SievePhysics 컴포넌트 Props 타입 정의
interface SievePhysicsProps {
  selectedLevel: number;
}

// 새로운 접근 방식: 전체 평면을 만들고 구멍 부분만 제외
function SievePhysics({ selectedLevel }: SievePhysicsProps) {
  const holes = holeDataByLevel[selectedLevel];
  
  // 격자 생성
  const grid: JSX.Element[] = [];
  
  for (let x = -gridSize; x <= gridSize; x += spacing) {
    for (let z = -gridSize; z <= gridSize; z += spacing) {
      const pos: [number, number, number] = [x, -0.2, z];
      
      // 구멍 감지 - 어떤 구멍과도 겹치지 않는 위치만 물리 박스 생성
      const isHole = holes.some(hole => {
        const dx = hole.position[0] - pos[0];
        const dz = hole.position[2] - pos[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < hole.radius*1.1; // 구멍 반경 내라면 true
      });
      
      // 구멍이 아닌 위치만 물리 충돌체 생성
      if (!isHole) {
        grid.push(
          <SolidCell key={`${x}-${z}`} position={pos} />
        );
      }
    }
  }
  
  return <>{grid}</>;
}

function SolidCell({ position }: { position: [number, number, number] }) {
  const ref = useRef(null);
  useBox(() => ({
    type: 'Static',
    args: [spacing * 0.95, 0.03, spacing * 0.95], // 더 얇은 충돌체
    position,
    friction: 0.05, // 마찰력 감소
    restitution: 0.2, // 약간의 탄성 추가
    // 충돌 그룹 설정
    collisionFilterGroup: 1, // 체는 그룹 1에 속함
    collisionFilterMask: 1, // 체는 그룹 1과만 충돌 (공들)
  }), ref);
  
  return null;
}
// 구멍 시각화 컴포넌트
function HoleVisual({ position, radius }: Hole) {
  return (
    <mesh position={[position[0], -0.6, position[2]]}>
      <cylinderGeometry args={[radius, radius, 0.1, 32]} />
      <meshStandardMaterial color="red" transparent opacity={0.4} />
    </mesh>
  );
}

// 외벽 충돌체
function CurvedWallCollider() {
  const segments = 32;
  const radius = 2.8;
  const height = 5;
  const thickness = 0.15;

  return (
    <>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotation: [number, number, number] = [0, -angle, 0];

        const ref = useRef(null);
        useBox(() => ({
          type: 'Static',
          args: [thickness, height, (2 * Math.PI * radius) / segments],
          position: [x, height / 2, z],
          rotation,
        }), ref);

        return (
          <mesh key={i} ref={ref} position={[x, height / 2, z]} rotation={rotation}>
            <boxGeometry args={[thickness, height, (2 * Math.PI * radius) / segments]} />
            <meshStandardMaterial wireframe color="white" transparent opacity={0.0} />
          </mesh>
        );
      })}
    </>
  );
}

// 메인 SieveModel 컴포넌트 - 오직 selectedLevel만 Props로 받음
export default function SieveModel({ selectedLevel }: SieveModelProps) {
  const visualRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/material/Streinergltf.gltf');
  const mesh = scene.children[selectedLevel]?.clone();
  const holes = holeDataByLevel[selectedLevel];

  return (
    <>
      {mesh && (
        <primitive object={mesh} ref={visualRef} position={[0, -0.7, 4.9]} scale={0.22} />
      )}

      {/* 물리 시스템 */}
      <SievePhysics selectedLevel={selectedLevel} />

      {/* 구멍 시각화 */}
      {/* {holes.map((hole, i) => (
        <HoleVisual key={`hole-${i}`} position={hole.position} radius={hole.radius} />
      ))} */}

      <CurvedWallCollider />
      
    </>
  );
}