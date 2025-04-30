//LensConcave.tsx
import { MeshProps } from '@react-three/fiber';

export function LensConcave(props: MeshProps) {
  return (
    <mesh {...props}>
      <cylinderGeometry args={[0.3, 0.1, 2, 32]} />
      <meshPhysicalMaterial
        color="skyblue"
        transmission={1}
        thickness={0.5}
        roughness={0}
        ior={1.5}
        transparent
      />
    </mesh>
  );
}
