// pages/index.tsx or App.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from '../components/5-2-3/Model'
import Scene from '@/components/canvas/Scene'

export default function Home() {
  return (
     <div className="w-screen h-screen bg-white flex flex-col">
        <Scene camera={{ position: [0, 1, 3], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
            <Model scale={1} position={[0, 0, 0]} />
        <OrbitControls />
        </Scene>
     </div>
    
  )
}