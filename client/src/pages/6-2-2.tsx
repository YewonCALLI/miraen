// pages/index.tsx
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experiment from '@/components/Candle/Experiment'
import { OrbitControls } from '@react-three/drei'

export default function Home() {
  const [uiText, setUiText] = useState('비커를 들어보세요!')

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background:'gray'}}>
      <Canvas camera={{ position: [2, 4, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <Experiment setUiText={setUiText} />
        {/* <OrbitControls/> */}

      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontSize: '1.2rem',
        pointerEvents: 'none'
      }}>
        {uiText}
      </div>
      
    </div>
  )
}
