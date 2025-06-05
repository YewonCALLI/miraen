// HomePage.tsx
import { Canvas, useThree } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { OpticalLab } from '../scenes/OpticalLab';
import { RayToggleButton } from '@/components/Light/buttonToggle';

const PostEffects = dynamic(() => import('../components/Light/PostEffects'), { ssr: false });

function SafePostEffects() {
  const { gl, scene, camera } = useThree();
  const isReady = gl && scene && camera;
  return isReady ? <PostEffects /> : null;
}

export default function Home() {
  const [activeMode, setActiveMode] = useState<'direct' | 'reflection' | 'refraction'>('reflection');
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex'); 
  const [rayVisible, setRayVisible] = useState(true);

  // 모드별 카메라 설정
  const cameraSettings = useMemo(() => {
    switch (activeMode) {
      case 'direct':
        return {
          position: [0, 2, 8],
          target: [0, 0, 0],
          maxPolarAngle: Math.PI / 2.5,
          minPolarAngle: Math.PI / 8
        };
      case 'reflection':
        return {
          position: [0, 8, 0],
          target: [0, 0, 0],
          maxPolarAngle: Math.PI / 2.2,
          minPolarAngle: 0
        };
      case 'refraction':
        return {
          position: [0, 2, 8],
          target: [0, 0, 0],
          maxPolarAngle: Math.PI / 2,
          minPolarAngle: Math.PI / 6
        };
      default:
        return {
          position: [0, 2, 8],
          target: [0, 0, 0],
          maxPolarAngle: Math.PI,
          minPolarAngle: 0
        };
    }
  }, [activeMode]);

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="flex-grow">
        <Canvas 
          camera={{ 
            position: cameraSettings.position as [number, number, number], 
            fov: 50 
          }}
          key={activeMode} // 모드 변경 시 카메라 리셋
        >
          <ambientLight intensity={4.0} />
          <Environment
            preset="warehouse"
            environmentIntensity={0.6}
            backgroundBlurriness={0.3}
            environmentRotation={[0, Math.PI / 4, 0]}
          />
          <OpticalLab mode={activeMode} lensType={lensType} rayVisible={rayVisible} />
          <RayToggleButton onToggle={() => setRayVisible(prev => !prev)} />
          <OrbitControls
            target={cameraSettings.target as [number, number, number]}
            maxPolarAngle={cameraSettings.maxPolarAngle}
            minPolarAngle={cameraSettings.minPolarAngle}
            enableRotate={true}
            enableZoom={true}
            enablePan={true}
          />
          <SafePostEffects />
        </Canvas>
      </div>
      
      <div className="h-16 bg-gray-900 flex justify-center items-center space-x-4 px-4">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded font-medium transition-colors ${
              activeMode === 'direct' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => setActiveMode('direct')}
          >
            빛의 직진
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-colors ${
              activeMode === 'reflection' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => setActiveMode('reflection')}
          >
            빛의 반사
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-colors ${
              activeMode === 'refraction' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => setActiveMode('refraction')}
          >
            빛의 굴절
          </button>
        </div>
        
        {activeMode === 'refraction' && (
          <div className="border-l border-gray-600 pl-4 ml-2 flex space-x-4">
            <button 
              className={`px-4 py-2 rounded font-medium transition-colors ${
                lensType === 'convex' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => setLensType('convex')}
            >
              볼록 렌즈
            </button>
            <button 
              className={`px-4 py-2 rounded font-medium transition-colors ${
                lensType === 'concave' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
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