// HomePage.tsx
import { Canvas, useThree } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { OpticalLab } from '../scenes/OpticalLab';
import { RayToggleButton } from '@/components/Light/buttonToggle';

const PostEffects = dynamic(() => import('../components/Light/PostEffects'), { ssr: false });

function SafePostEffects() {
  const { gl, scene, camera } = useThree();
  const isReady = gl && scene && camera;
  return isReady ? <PostEffects /> : null;
}

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<'direct' | 'reflection' | 'refraction'>('reflection');
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex'); 
  const [rayVisible, setRayVisible] = useState(true);

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={4.0} />
          <Environment
            preset="warehouse"
            environmentIntensity={0.6}
            backgroundBlurriness={0.3}
            environmentRotation={[0, Math.PI / 4, 0]}
          />
          <OpticalLab mode={activeMode} lensType={lensType} rayVisible={rayVisible} />
          <RayToggleButton onToggle={() => setRayVisible(prev => !prev)} 
          />
          <OrbitControls
            maxPolarAngle={activeMode === 'reflection' ? Math.PI / 2.5 : Math.PI}
            minPolarAngle={activeMode === 'reflection' ? Math.PI / 6 : 0}
          />
          <SafePostEffects />
        </Canvas>
      </div>
      
      {/* Control buttons at the bottom */}
      <div className="h-16 bg-gray-900 flex justify-center items-center space-x-4 px-4">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded font-medium ${activeMode === 'direct' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setActiveMode('direct')}
          >
            빛의 직진
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${activeMode === 'reflection' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setActiveMode('reflection')}
          >
            빛의 반사
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${activeMode === 'refraction' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setActiveMode('refraction')}
          >
            빛의 굴절
          </button>
        </div>
        
        {/* Lens type selection - only visible in refraction mode */}
        {activeMode === 'refraction' && (
          <div className="border-l border-gray-600 pl-4 ml-2 flex space-x-4">
            <button 
              className={`px-4 py-2 rounded font-medium ${lensType === 'convex' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}
              onClick={() => setLensType('convex')}
            >
              볼록 렌즈
            </button>
            <button 
              className={`px-4 py-2 rounded font-medium ${lensType === 'concave' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}
              onClick={() => setLensType('concave')}
            >
              오목 렌즈
            </button>
          </div>
        )}
      </div>
    </div>
  );
}