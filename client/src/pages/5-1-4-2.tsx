import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AnimatedModel2 from '../components/AnimatedModel2'
import { useState } from 'react'

export default function Home() {
  const [action, setAction] = useState<'extend' | 'fold'>('fold')

  const [lineTargetPosA, setLineTargetPosA] = useState<[number, number, number]>([-0.035, 0.001, -0.015])
  const [lineTargetPosB, setLineTargetPosB] = useState<[number, number, number]>([-0.035, 0.001, -0.015])
  const [hasExtended, setHasExtended] = useState(false)

  const handleExtend = () => {
    setAction('extend')

    if (!hasExtended) {
      setLineTargetPosA(([x, y, z]) => [x, y, z+0.001] as [number, number, number])
      setLineTargetPosB(([x, y, z]) => [x, y, z+0.005] as [number, number, number])
      setHasExtended(true)
    }
  }

  const handleFold = () => {
    setAction('fold')
    setLineTargetPosA([-0.035, 0.001, -0.015])
    setLineTargetPosB([-0.035, 0.001, -0.015])
    setHasExtended(false)
  }

  return (
    <>
      <Canvas shadows camera={{ position: [-0.1, 0.1, 0.13], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
        {/* Ambient Light */}
        <fog attach="fog" args={['#f0f0f0', 0.3, 0.9]} />
        <ambientLight intensity={3.0} />

        {/* Model */}
        <AnimatedModel2
          url="/models/Anatomy/Arm/Arm_Movement.gltf"
          actionName={action}
          scale={1.5}
          position={[0, -0.2, 0]}
          lineTargetPosA={lineTargetPosA}
          lineTargetPosB={lineTargetPosB}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>

          <shadowMaterial opacity={0.4} />
        </mesh>

        <directionalLight
          position={[0, 5, 1]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={10}
          shadow-camera-left={-1}
          shadow-camera-right={1}
          shadow-camera-top={1}
          shadow-camera-bottom={-1}
        />

        <directionalLight
          position={[-0.5, 0.2, 0.3]} // 왼쪽 위에서 비추는 느낌
          intensity={0.8}
          color="#B388EB" // 연보라
        />

        <directionalLight
          position={[0.5, 0.2, 0.3]} // 오른쪽 위에서 비추는 느낌
          intensity={0.8}
          color="#FF8DC7" // 핑크
        />



        <OrbitControls minDistance={0.18} maxDistance={0.4} />
      </Canvas>

      {/* Buttons */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        bottom: '4%',
        left: '50%',
        transform: 'translateX(-50%)',
        gap: '10px'
      }}>
        <button
          onClick={handleFold}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}>
          팔 펴기
        </button>
        <button
          onClick={handleExtend}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}>
          팔 접기
        </button>
      </div>
    </>
  )
}
