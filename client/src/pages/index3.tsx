import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AnimatedModel2 from '../components/AnimatedModel2'
import { useState, Suspense } from 'react'
import Loading from '@/components/canvas/Scene/Loading'


export default function Page() {
  const [action, setAction] = useState<'extend' | 'fold'>('extend')

  return (
    <>
      <Loading camera={{ position: [-0.1, 0.1, 0.0], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
      <AnimatedModel2
          url="/models/Anatomy/Arm/Arm_Movement.gltf"
          actionName={action}
          scale={1.5}
          position={[0, -0.2, 0]}
          lineTargetPosA={[-0.02, 0.03, -0.02]} 
          lineTargetPosB={[-0.03, 0.02, -0.015]}
        />

        <ambientLight intensity={1.0} />
        <directionalLight position={[-5, 5, 5]} intensity={2} />
        <OrbitControls minDistance={0.2} maxDistance={0.6} />
      </Loading>
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
