// scenes/SieveScene.tsx
import { useBox, usePlane, useSphere, useCylinder } from '@react-three/cannon';
import { useRef, useState, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { useControls } from 'leva';
import { useThree } from '@react-three/fiber';

function Plane() {
  const ref = useRef<Mesh>(null);
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
    position: [0, -0.5, 0] as [number, number, number],
  }), ref);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function Particle({ position, radius }: { position: [number, number, number]; radius: number }) {
  const ref = useRef<Mesh>(null);
  useSphere(() => ({ 
    mass: 1, 
    position, 
    args: [radius],
    linearDamping: 0.1, // 조금의 감쇠 추가
    friction: 0.5,
  }), ref);
  
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={radius > 0.4 ? 'orange' : radius > 0.2 ? 'skyblue' : 'limegreen'} />
    </mesh>
  );
}

// 구멍 하나를 처리하는 컴포넌트 (시각적인 구멍 + 물리적인 링)
function Hole({ position, radius, thickness }: { 
  position: [number, number, number];
  radius: number; 
  thickness: number;
}) {
  const ringRef = useRef<Group>(null);
  
  // 링의 물리적 특성
  const segmentCount = 8; // 링을 구성할 세그먼트 수
  const segmentSize = 0.; // 세그먼트 크기
  const circleRadius = radius + segmentSize/2; // 링의 중심 반지름
  
  // 링 세그먼트 배치를 위한 각도 계산
  const segments = [];
  for (let i = 0; i < segmentCount; i++) {
    const angle = (Math.PI * 2 / segmentCount) * i;
    const x = Math.cos(angle) * circleRadius;
    const z = Math.sin(angle) * circleRadius;
    segments.push({ x, z, angle });
  }

  return (
    <group ref={ringRef} position={position}>
      {/* 시각적 구멍 (검은색 원통) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, thickness + 0.01, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* 물리적 링 세그먼트 (보이지 않음) */}
      {segments.map((segment, i) => (
        <RingSegment 
          key={i}
          position={[segment.x, 0, segment.z]}
          rotation={[0, segment.angle + Math.PI/2, 0]}
          size={[segmentSize, thickness, 2 * Math.sin(Math.PI / segmentCount) * circleRadius]}
        />
      ))}
    </group>
  );
}

// 링 세그먼트 (보이지 않는 물리적 박스)
function RingSegment({ position, rotation, size }: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
}) {
  const ref = useRef<Mesh>(null);
  useBox(() => ({
    type: 'Static',
    position,
    rotation,
    args: size,
  }), ref);

  // 기본적으로는 보이지 않음 (디버깅 시 주석 해제)
  return null;
  
  // 디버깅용 시각화 요소
  /*
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="red" wireframe />
    </mesh>
  );
  */
}

function SievePlate({ position, size, thickness, holeSize, holeSpacing }: {
  position: [number, number, number];
  size: number;
  thickness: number;
  holeSize: number;
  holeSpacing: number;
}) {
  // 바닥 판을 하나의 static rigid body로 구현
  const plateRef = useRef<Mesh>(null);
  useBox(() => ({
    type: 'Static',
    position,
    args: [size, thickness, size],
  }), plateRef);
  
  // 구멍 위치 계산 (균일한 간격으로)
  const holes = [];
  const offset = size / 2 - holeSpacing / 2;
  const holesPerRow = Math.floor(size / holeSpacing);
  
  for (let i = 0; i < holesPerRow; i++) {
    for (let j = 0; j < holesPerRow; j++) {
      const x = -offset + i * holeSpacing;
      const z = -offset + j * holeSpacing;
      holes.push([x, 0, z]);
    }
  }
  
  return (
    <group position={position}>
      {/* 단단한 바닥 판 */}
      <mesh ref={plateRef} receiveShadow>
        <boxGeometry args={[size, thickness, size]} />
        <meshStandardMaterial color="silver" />
      </mesh>
      
      {/* 구멍들 (각 구멍은 시각적 원통 + 물리적 링) */}
      {holes.map((holePos, i) => (
        <Hole 
          key={i} 
          position={holePos} 
          radius={holeSize} 
          thickness={thickness} 
        />
      ))}
    </group>
  );
}

function SideWall({ position, size, height, rotation = [0, 0, 0] }: {
  position: [number, number, number];
  size: [number, number];
  height: number;
  rotation?: [number, number, number];
}) {
  const ref = useRef<Mesh>(null);
  useBox(() => ({
    type: 'Static',
    position,
    rotation,
    args: [size[0], height, size[1]],
  }), ref);

  return (
    <mesh ref={ref} position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[size[0], height, size[1]]} />
      <meshStandardMaterial color="darkgray" transparent opacity={0.7} />
    </mesh>
  );
}

function BoxWithHoles({ holeSize }: { holeSize: number }) {
  const sieveSize = 6;
  const thickness = 0.3;
  const wallHeight = 1.5;
  const wallThickness = 0.2;
  const holeSpacing = 1.2; // 구멍 간 간격
  
  return (
    <group position={[0, 1, 0]}>
      {/* 구멍이 뚫린 체 바닥판 */}
      <SievePlate 
        position={[0, 0, 0]} 
        size={sieveSize} 
        thickness={thickness} 
        holeSize={holeSize} 
        holeSpacing={holeSpacing}
      />
      
      {/* 체 옆면들 */}
      <SideWall 
        position={[0, wallHeight/2, sieveSize/2 - wallThickness/2]} 
        size={[sieveSize, wallThickness]} 
        height={wallHeight} 
      />
      <SideWall 
        position={[0, wallHeight/2, -sieveSize/2 + wallThickness/2]} 
        size={[sieveSize, wallThickness]} 
        height={wallHeight} 
      />
      <SideWall 
        position={[-sieveSize/2 + wallThickness/2, wallHeight/2, 0]} 
        size={[wallThickness, sieveSize - 2*wallThickness]} 
        height={wallHeight} 
      />
      <SideWall 
        position={[sieveSize/2 - wallThickness/2, wallHeight/2, 0]} 
        size={[wallThickness, sieveSize - 2*wallThickness]} 
        height={wallHeight} 
      />
    </group>
  );
}

export default function SieveScene() {
  const holeSize = 0.2; // 가장 작은 입자와 동일한 지름
  
  // 제어 옵션
  const { particleCount } = useControls({
    particleCount: { value: 20, min: 5, max: 50, step: 1 }
  });

  // 입자 생성
  const [particles] = useState<{ position: [number, number, number]; radius: number }[]>(() => {
    const ps = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 5;
      const z = (Math.random() - 0.5) * 5;
      const y = 5 + Math.random() * 2;
      // 세 가지 크기의 입자 생성
      const radius = [0.5, 0.3, 0.2][Math.floor(Math.random() * 3)];
      ps.push({ position: [x, y, z], radius });
    }
    return ps;
  });

  return (
    <>
      <Plane />
      <BoxWithHoles holeSize={holeSize} />
      {particles.map((p, i) => (
        <Particle key={i} position={p.position} radius={p.radius} />
      ))}
    </>
  );
}