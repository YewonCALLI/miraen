import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface Props {
  groupRef: React.RefObject<Group>;
  shake: boolean;
}

export default function ShakeController({ groupRef, shake }: Props) {
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!shake || !groupRef.current) return;
    time.current += delta;
    groupRef.current.rotation.x = Math.sin(time.current * 10) * 0.1;
    groupRef.current.rotation.z = Math.cos(time.current * 10) * 0.1;
  });

  return null;
}
