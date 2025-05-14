import { useSphere } from '@react-three/cannon';
import { useRef } from 'react';
import { Mesh } from 'three';

interface Props {
  position: [number, number, number];
  radius: number;
}

export default function Particle({ position, radius }: Props) {
  const ref = useRef<Mesh>(null);
  useSphere(() => ({
    mass: 1,
    position,
    args: [radius],
    linearDamping: 0.1,
    friction: 0.5,
  }), ref);

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={radius > 0.4 ? 'orange' : 'limegreen'} />
    </mesh>
  );
}
