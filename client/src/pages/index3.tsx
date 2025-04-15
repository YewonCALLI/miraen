import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AnimatedModel2 from '../components/AnimatedModel2'
import { useState, Suspense } from 'react'
import Loading from '@/components/canvas/Scene/Loading'
import { SoftShadows } from '@react-three/drei'


export default function Page() {
  const [action, setAction] = useState<'extend' | 'fold'>('extend')

  return (
    <>
      <Canvas shadows camera={{ position: [-0.1, 0.1, 0.0], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
      <ambientLight intensity={1.0} />
      <AnimatedModel2
          url="/models/Anatomy/Arm/Arm_Movement.gltf"
          actionName={action}
          scale={1.5}
          position={[0, -0.2, 0]}
          lineTargetPosA={[-0.042, 0.002, -0.01]} 
          lineTargetPosB={[-0.03, 0.007, -0.01]}
        />

        <ambientLight intensity={1.0} />
        <directionalLight position={[-0, 5, 1]} intensity={2.0} castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}/>
        <OrbitControls minDistance={0.2} maxDistance={0.6} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#dddddd" />
          <shadowMaterial opacity={0.3} />
        </mesh>


      </Canvas>
      <div style={{ position: 'absolute', display: 'flex', bottom: '4%', left: '50%', transform: 'translateX(-50%)', gap: '10px'}}>
        <button
          onClick={() => setAction('extend')}
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
        <br />
        <button
          onClick={() => setAction('fold')}
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
      </div>
    </>
  )
}
