import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface ModelProps {
  path: string
  scale?: number
  position?: [number, number, number]
  sceneIndex?: number
  onLoaded?: () => void
}

export default function Model({ path, scale = 4, position = [0, 0, 0], sceneIndex, onLoaded}: ModelProps) {
  const { scene: originalScene, animations } = useGLTF(path)
  const mixer = useRef<THREE.AnimationMixer | null>(null)
  const hasCalledOnLoaded = useRef(false)

  const clonedScene = useMemo(() => {
    const cloned = originalScene.clone(true)

    // 이름이 Terrain인 오브젝트 제거
    const terrain = cloned.getObjectByName('Terrain')
    if (terrain) {
      terrain.parent?.remove(terrain)
      console.log('Removed Terrain object')
    }

    // 그림자 설정
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    return cloned
  }, [originalScene, sceneIndex])

  
  // 애니메이션 처리 및 onLoaded 호출
  useEffect(() => {
    hasCalledOnLoaded.current = false
    
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(clonedScene)
      const action = mixer.current.clipAction(animations[0])
      action.play()
    }

    if (onLoaded && !hasCalledOnLoaded.current) {
      hasCalledOnLoaded.current = true
      onLoaded()
    }
  }, [animations, clonedScene, onLoaded, sceneIndex])

  useFrame((_, delta) => {
    mixer.current?.update(delta * 0.5)
  })

  return <primitive object={clonedScene} scale={scale} position={position} />
}