import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AnimatedModel2 from './AnimatedModel2'
import { useState } from 'react'

function App() {
  const [action, setAction] = useState<'extend' | 'fold'>('extend')

  return (
    <>
      <Canvas camera={{ position: [0, 0.5, 0.5], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <AnimatedModel2 url="/models/Anatomy/Arm/Arm_Movement.gltf" actionName={action} scale={1.5} position={[0, -0.2, 0]} />
        <OrbitControls minDistance={0.22} maxDistance={0.4}/>
      </Canvas>
      <div style={{ position: 'absolute', top: 150, left: 200, }}>
        <button onClick={() => setAction('extend')}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',          
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>팔 펴기</button>
        <br />
        <button onClick={() => setAction('fold')}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',          
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>팔 접기</button>
      </div>
    </>
  )
}

export default App
