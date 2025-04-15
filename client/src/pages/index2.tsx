import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AnimatedModel from '../components/AnimatedModel'
import { useState } from 'react'

type ModelType = 'boy' | 'muscle' | 'bone'
type AnimationState = 'walk' | 'pose'

export default function Page() {
  const [modelType, setModelType] = useState<ModelType>('boy')
  const [animState, setAnimState] = useState<AnimationState>('pose')

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
    Boy_Pose: 1,
    Muscle_Walking: 1,
    Muscle_Pose: 0,
  }

  const animIndex = animIndexMap[modelKey] ?? 0

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0.5, 0.5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <AnimatedModel
          key={`${modelUrl}-${modelType}-${animState}`} // ← 모델 상태 전체 반영
          url={modelUrl}
          animIndex={animIndex}
          scale={0.5}
          position={[0, -0.2, 0]}
          loop={true}
          removeMuscleLayer={modelType === 'bone'} // ← bone일 때만 제거
        />

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
              }}>
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
              }}>
              {type === 'boy' ? '피부' : type === 'muscle' ? '근육' : '뼈'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
