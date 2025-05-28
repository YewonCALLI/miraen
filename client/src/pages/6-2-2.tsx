import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Experiment from '@/components/Candle/Experiment'

export default function App() {
  return (
    <div className="fixed inset-0 bg-black">
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        position={[2, 3, 2]}
        intensity={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={10}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        />

      <Experiment />
      <OrbitControls />

    </Canvas>
    </div>
  )
}
