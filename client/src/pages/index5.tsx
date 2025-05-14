import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const SieveScene = dynamic(() => import('../scenes/SieveSimulation'), { ssr: false });

export default function Index5() {
  const [shake, setShake] = useState(false);
  const [triggerSpawn, setTriggerSpawn] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <OrbitControls />
        <Physics gravity={[0, -9.81, 0]}>
          <SieveScene shake={shake} triggerSpawn={triggerSpawn} onSpawnHandled={() => setTriggerSpawn(false)} />
        </Physics>
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => setShake((prev) => !prev)}>
          {shake ? '정지' : '흔들기'}
        </button>
        <button style={{ marginLeft: 10 }} onClick={() => setTriggerSpawn(true)}>
          Particle 뿌리기
        </button>
      </div>
    </div>
  );
}
