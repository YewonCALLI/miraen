import { Canvas, useThree } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { OpticalLab } from '../scenes/OpticalLab';

const PostEffects = dynamic(() => import('../components/Light/PostEffects'), { ssr: false });

function SafePostEffects() {
  const { gl, scene, camera } = useThree();

  const isReady = gl && scene && camera;
  return isReady ? <PostEffects /> : null;
}

export default function HomePage() {
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <Environment preset="night" />
        <OpticalLab />
        <OrbitControls />
        <SafePostEffects />
      </Canvas>
    </div>
  );
}
