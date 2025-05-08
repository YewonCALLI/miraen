// pages/index5.tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';

const SieveScene = dynamic(() => import('../scenes/SieveScene'), { ssr: false });

export default function Index5() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <OrbitControls />
        <Physics gravity={[0, -9.81, 0]}>
          <SieveScene />
        </Physics>
      </Canvas>
    </div>
  );
}
