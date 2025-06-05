// pages/index.tsx or App.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from '../components/Sugar/Model'

export default function Home() {
  return (
     <div className="w-screen h-screen bg-white flex flex-col">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
        <ambientLight intensity={2.0}/>
        <directionalLight intensity={2.0} position={[2, 2, 2]} />
            <Model scale={1} position={[0, 0, 0]} />
        <OrbitControls />
        </Canvas>
     </div>
    
  )
}
