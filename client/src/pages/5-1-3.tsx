import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from '../components/Sugar/Model'
import { Environment } from '@react-three/drei'
import { MeshTransmissionMaterial, AccumulativeShadows, RandomizedLight } from '@react-three/drei'


export default function Home() {
  return (
     <div className="w-screen h-screen bg-white flex flex-col">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={2.5} position={[2, 4, 2]} castShadow />
          <Environment
            preset="warehouse"
          />
        <Model scale={1} position={[0, -0.6, 0]} />
        <OrbitControls/>
      </Canvas>
     </div>
  )
}