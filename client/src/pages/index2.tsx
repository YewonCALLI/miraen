import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import AnimatedModel from '../components/AnimatedModel'
import { useState, useEffect } from 'react'
import { ContactShadows } from '@react-three/drei'


type ModelType = 'boy' | 'muscle' | 'bone'
type AnimationState = 'walk' | 'pose'

// 모든 가능한 모델 URL을 미리 계산
const preloadModelUrls = [
  '/models/Anatomy/Boy_Walking.gltf',
  '/models/Anatomy/Boy_Pose.gltf',
  '/models/Anatomy/Muscle_Walking.gltf',
  '/models/Anatomy/Muscle_Pose.gltf'
]

// 각 URL에 대해 bone 버전도 캐시 키 추가
const allPreloadUrls = [
  ...preloadModelUrls,
  ...preloadModelUrls.map(url => `${url}#bone`)
]

export default function Page() {
  const [modelType, setModelType] = useState<ModelType>('boy')
  const [animState, setAnimState] = useState<AnimationState>('pose')
  const [isLoading, setIsLoading] = useState(true)

  // 모델 사전 로딩
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true)
      
      console.log('Preloading models...')
      
      // 모든 모델 URL 사전 로딩
      for (const url of allPreloadUrls) {
        useGLTF.preload(url)
        // 약간의 지연을 추가하여 브라우저가 무응답 상태가 되지 않도록 함
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log('All models preloaded!')
      setIsLoading(false)
    }
    
    loadModels()
    
    // 컴포넌트 언마운트 시 캐시 정리 (선택 사항)
    return () => {
      allPreloadUrls.forEach(url => useGLTF.clear(url))
    }
  }, [])

  // 실제 로드할 모델 키 (bone도 muscle 로드)
  const getModelKey = () => {
    const base = modelType === 'bone' ? 'Muscle' : modelType.charAt(0).toUpperCase() + modelType.slice(1)
    const anim = animState === 'walk' ? 'Walking' : 'Pose'
    return `${base}_${anim}`
  }

  const modelKey = getModelKey()
  const modelUrl = `/models/Anatomy/${modelKey}.gltf`

  // 애니메이션 인덱스 (필요하면 정확하게 설정)
  const animIndexMap: Record<string, number> = {
    Boy_Walking: 3,
    Boy_Pose: 2,
    Muscle_Walking: 1,
    Muscle_Pose: 0,
  }

  const animIndex = animIndexMap[modelKey] ?? 0

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          fontSize: '24px',
          zIndex: 1000
        }}>
          모델 로딩 중... 잠시만 기다려주세요.
        </div>
      )}
      
      <Canvas shadows camera={{ position: [0, 0.5, 0.5], fov: 75 }} style={{ width: '100%', height: '100%' }}>

        <ambientLight intensity={1.0} />
        <directionalLight position={[1, 5, 1]} intensity={1.7} castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={10}
          shadow-camera-left={-1}
          shadow-camera-right={1}
          shadow-camera-top={1}
          shadow-camera-bottom={-1}
        />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.2, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#000" />
          <shadowMaterial opacity={0.4} />
        </mesh>


        {!isLoading && (
          <AnimatedModel
            key={`${modelUrl}-${modelType}-${animState}`} // ← 모델 상태 전체 반영
            url={modelUrl}
            animIndex={animIndex}
            scale={0.5}
            position={[0, -0.2, 0]}
            loop={true}
            removeMuscleLayer={modelType === 'bone'} // ← bone일 때만 제거
          />
        )}

        <OrbitControls minDistance={0.22} maxDistance={0.4} />
      </Canvas>

      {/* UI */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '10px',
          borderRadius: '8px',
        }}>
        {/* 애니메이션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {['walk', 'pose'].map((state) => (
            <button
              key={state}
              onClick={() => setAnimState(state as AnimationState)}
              style={{
                padding: '8px 16px',
                backgroundColor: animState === state ? '#4CAF50' : '#f1f1f1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
              disabled={isLoading}
            >
              {state === 'walk' ? '걷기' : '정지'}
            </button>
          ))}
        </div>

        {/* 모델 타입 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {(['boy', 'muscle', 'bone'] as ModelType[]).map((type) => (
            <button
              key={type}
              onClick={() => setModelType(type)}
              style={{
                padding: '8px 16px',
                backgroundColor: modelType === type ? '#2196F3' : '#f1f1f1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
              disabled={isLoading}
            >
              {type === 'boy' ? '피부' : type === 'muscle' ? '근육' : '뼈'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}