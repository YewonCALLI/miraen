import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import Model from '../components/Dinosaur/Model'
import LoadingScreen from '../components/Dinosaur/LoadingScreen'
import { useEffect, useState } from 'react'

const modelPaths = [
  'models/Dinosaur/1/Dino.gltf',
  'models/Dinosaur/2/Dino.gltf',
  'models/Dinosaur/3/Dino.gltf',
  'models/Dinosaur/4/Dino.gltf',
]

export default function Home() {
  const [sceneIndex, setSceneIndex] = useState(1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function preloadAll() {
      try {
        await Promise.all(modelPaths.map((path) => useGLTF.preload(path)))
        setLoaded(true)
      } catch (err) {
        console.error('모델 로딩 실패:', err)
      }
    }

    preloadAll()
  }, [])

  if (!loaded) return <LoadingScreen />

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="flex justify-center gap-4 p-4 bg-gray-900 text-white z-10">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setSceneIndex(num)}
            className={`px-4 py-2 rounded ${
              sceneIndex === num ? 'bg-blue-500' : 'bg-gray-700'
            }`}
          >
            Scene {num}
          </button>
        ))}
      </div>

      <Canvas shadows camera={{ position: [0, 15, 0], fov: 50 }}>
        <ambientLight />
        <directionalLight castShadow position={[2, 5, 2]} />
        <Model
          key={sceneIndex}
          path={modelPaths[sceneIndex - 1]}
          scale={1}
          position={[0, 0, 0]}
        />

        {(sceneIndex === 1 || sceneIndex === 2) && (
          <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="skyblue" transparent opacity={0.3} />
          </mesh>
        )}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
