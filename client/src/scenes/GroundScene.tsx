import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function GroundScene({ mode, cameraTarget }: { mode: string; cameraTarget: [number, number, number] | null }) {
  const visible = mode === 'ground'
  if (!visible || !cameraTarget) return null

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0.1, 0], fov: 75 }}>
        <CameraToSurface target={cameraTarget} />
        <ambientLight intensity={1.5} />
        <OrbitControls enablePan={false} enableZoom={false} />
        <SkySphere />
      </Canvas>
    </div>
  )
}

function CameraToSurface({ target }: { target: [number, number, number] }) {
  const { camera } = useThree()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      const offset = new THREE.Vector3(0, 0.1, 0.2) // 위에 살짝 띄운 후 우주 방향으로
      const cameraPos = new THREE.Vector3(...target).add(offset)
      camera.position.copy(cameraPos)
      camera.lookAt(new THREE.Vector3(...target))
      initialized.current = true
    }
  }, [camera, target])

  return null
}

function SkySphere() {
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial color={'#111'} side={THREE.BackSide} />
    </mesh>
  )
}
