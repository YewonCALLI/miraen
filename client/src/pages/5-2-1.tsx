//혼합물의 분리 5-2-1.tsx
import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import dynamic from 'next/dynamic';

const SieveSimulation = dynamic(() => import('../scenes/SieveSimulation'), { ssr: false });

export default function Home() {
  const [triggerSpawn, setTriggerSpawn] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [enableTilt, setEnableTilt] = useState(true); // 기본적으로 기울이기 활성화
  const [gravity, setGravity] = useState<[number, number, number]>([0, -9.81, 0]);

  const handleSpawn = () => {
    setTriggerSpawn(true);
  };

  const handleSpawnHandled = () => {
    setTriggerSpawn(false);
  };

  return (
    <div className="w-screen h-screen relative">
      {/* 버튼 UI */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-10">
        <div className="flex gap-2">
          {[0, 1, 2].map((level) => (
            <button
              key={level}
              className={`px-4 py-2 rounded text-white transition-colors ${
                selectedLevel === level
                  ? 'bg-blue-700 font-bold'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={() => setSelectedLevel(level)}
            >
              {level === 0 ? '큰 구멍' : level === 1 ? '작은 구멍' : '중간 구멍'}
            </button>
          ))}
        </div>

       <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded" onClick={handleSpawn}>
            Particle 뿌리기
          </button>
      </div>

      {/* 기울이기 안내 */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white py-2 px-4 rounded">
        체를 마우스로 드래그하여 기울일 수 있습니다
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

        <Physics 
          gravity={gravity} 
          allowSleep={false}
          defaultContactMaterial={{
            friction: 0.2,
            restitution: 0.3,
          }}
        >
          <SieveSimulation
            triggerSpawn={triggerSpawn}
            onSpawnHandled={handleSpawnHandled}
            selectedLevel={selectedLevel}
            setGravity={setGravity}
          />
        </Physics>
      </Canvas>
    </div>
  );
}