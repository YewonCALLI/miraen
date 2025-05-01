import { Canvas, useThree } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { OrbitControls, Environment, Lightformer } from '@react-three/drei';
import { OpticalLab } from '../scenes/OpticalLab';
import { CustomEnvironment } from '@/components/Light/CustomEnvironment'


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
        <ambientLight intensity={2.0} />
        {/* <CustomEnvironment /> */}
        <Environment
          preset="warehouse"
          environmentIntensity={0.05}  // ✅ 밝기: 0.0 ~ 2.0 추천
          backgroundBlurriness={0.3}
          environmentRotation={[0,Math.PI/2,0]}
        />

        <OpticalLab />
        <OrbitControls maxPolarAngle={Math.PI/2} maxDistance={10.0}/>
        <SafePostEffects />
        {/* <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[50, 2, 0]} scale={[100, 2, 1]} /> */}

      </Canvas>
    </div>
  );
}
