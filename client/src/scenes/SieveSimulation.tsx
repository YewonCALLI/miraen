import { useState, useRef, useMemo, useEffect} from 'react';
import { Group } from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import SieveModel from '../components/material/SieveModel';
import Particle from '../components/material/Particle';
import ShakeController from '../components/material/ShakeController';
import UI from '../components/material/UI';
import { Html } from '@react-three/drei';


interface Props {
  shake: boolean;
  triggerSpawn: boolean;
  onSpawnHandled: () => void;
}

type ParticleData = {
  id: string;
  radius: number;
  position: [number, number, number];
};

export default function SieveSimulation({ shake, triggerSpawn, onSpawnHandled }: Props) {
  const [level, setLevel] = useState(1);
  const groupRef = useRef<Group>(null);
  const [particles, setParticles] = useState<ParticleData[]>([]);

  const spawnParticles = () => {
    const newParticles = Array.from({ length: 10 }, () => {
      const radius = [0.5, 0.3, 0.2][Math.floor(Math.random() * 3)];
      const x = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      const y = 5 + Math.random() * 3;
      return {
        id: crypto.randomUUID(),
        radius,
        position: [x, y, z] as [number, number, number],
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // 떨어진 particle 제거
  useFrame(() => {
    setParticles((prev) => prev.filter((p) => p.position[1] > -5));
  });

  // 외부 trigger로 입자 생성
  useEffect(() => {
    if (triggerSpawn) {
      spawnParticles();
      onSpawnHandled(); // flag reset
    }
  }, [triggerSpawn, onSpawnHandled]);

  return (
    <>
      <UI onChange={(val) => setLevel(val)} />
      <group ref={groupRef}>
        <SieveModel selectedLevel={level} />
      </group>
      <ShakeController groupRef={groupRef} shake={shake} />
      {particles.map((p) => (
        <Particle key={p.id} position={p.position} radius={p.radius} />
      ))}
    </>
  );
}
