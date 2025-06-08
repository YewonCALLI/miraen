import { useGLTF } from '@react-three/drei'
import { GroupProps, useFrame } from '@react-three/fiber'
import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { SugarParticles } from './SugarParticles'
import { RealisticWater } from './RealisticWater'

interface ModelProps extends GroupProps {
  isStirring?: boolean;
  stirringSpeed?: number;
}

export default function Model({ isStirring = false, stirringSpeed = 1, ...props }: ModelProps) {
  const { scene } = useGLTF('models/Sugar/Beaker_scene.gltf')
  const [filteredScene, setFilteredScene] = useState<THREE.Group | null>(null)
  const [beakerInfo, setBeakerInfo] = useState<{
    radius: number;
    height: number;
    position: THREE.Vector3;
  } | null>(null)
  const [spoonRotation, setSpoonRotation] = useState(new THREE.Euler())
  const [spoonPosition, setSpoonPosition] = useState(new THREE.Vector3())
  const [isPouring, setIsPouring] = useState(false)
  const groupRef = useRef<THREE.Group>(null!)
  const waterRef = useRef<THREE.Group>(null!)
  
  useEffect(() => {
    console.log('Original children:', scene.children)
    
    const newScene = new THREE.Group()
    
    if (scene.children[0]) {
      scene.children[0].scale.set(0.1, 0.1, 0.1)
      scene.children[0].position.set(0, 0, 0)
      
      const box = new THREE.Box3().setFromObject(scene.children[0])
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      
      setBeakerInfo({
        radius: Math.max(size.x, size.z) * 0.4,
        height: size.y * 0.8,
        position: center
      })
      
      newScene.add(scene.children[0].clone())
    }
    
    setFilteredScene(newScene)
  }, [scene])

  useFrame((state) => {
    if (isStirring && waterRef.current) {
      const time = state.clock.elapsedTime * stirringSpeed
      
      waterRef.current.rotation.y = Math.sin(time) * 0.1
      waterRef.current.position.x = Math.sin(time * 2) * 0.02
      waterRef.current.position.z = Math.cos(time * 2) * 0.02
      
      const waveHeight = Math.sin(time * 3) * 0.05
      waterRef.current.position.y = waveHeight
    }
  })

  if (!filteredScene || !beakerInfo) return null
  
  return (
    <group ref={groupRef} {...props}>
      <primitive object={filteredScene} />
            <group ref={waterRef}>
        <SugarParticles />
        <RealisticWater 
          beakerRadius={beakerInfo.radius}
          waterLevel={beakerInfo.height * 0.7}
          position={[
            beakerInfo.position.x-0.02,
            beakerInfo.position.y - beakerInfo.height * 0.2,
            beakerInfo.position.z
          ]}
        />
      </group>
    
      
      {/* 설탕 파티클 (주석 해제하여 사용) */}
      {/* <SugarParticles 
        spoonRotation={spoonRotation}
        spoonPosition={spoonPosition}
        isPouring={isPouring}
      /> */}
    </group>
  )
}