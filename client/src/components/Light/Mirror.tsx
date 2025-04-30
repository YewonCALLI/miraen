//Mirror.tsx
import { MeshProps } from '@react-three/fiber';

export function Mirror(props: MeshProps) {
  return (
    <mesh {...props}>
      <planeGeometry args={[2, 4]} />
      <meshStandardMaterial
        metalness={1}
        roughness={0}
        color="#cccccc"
        envMapIntensity={1}
      />
    </mesh>
  );
}
