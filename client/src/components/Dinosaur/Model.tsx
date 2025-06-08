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
  const sceneRef = useRef<number>(-1)

  const clonedScene = useMemo(() => {
    console.log(`Creating cloned scene for scene ${sceneIndex} with path: ${path}`)
    
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
  }, [originalScene, sceneIndex, path])

  // 씬이 변경되었을 때 onLoaded 호출 상태 리셋
  useEffect(() => {
    if (sceneRef.current !== sceneIndex) {
      console.log(`Scene changed from ${sceneRef.current} to ${sceneIndex}`)
      sceneRef.current = sceneIndex || -1
      hasCalledOnLoaded.current = false
    }
  }, [sceneIndex])

  // 애니메이션 처리 및 onLoaded 호출
  useEffect(() => {
    console.log(`Model effect running for scene ${sceneIndex}`)
    
    // 애니메이션 설정
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(clonedScene)
      const action = mixer.current.clipAction(animations[0])
      action.play()
      console.log(`Animation started for scene ${sceneIndex}`)
    }

    // onLoaded 콜백 호출 (씬당 한 번만)
    if (onLoaded && !hasCalledOnLoaded.current) {
      console.log(`Calling onLoaded for scene ${sceneIndex}`)
      hasCalledOnLoaded.current = true
      
      // 다음 프레임에 호출하여 렌더링이 완료된 후 실행되도록 함
      requestAnimationFrame(() => {
        onLoaded()
      })
    }

    // 클린업 함수
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction()
        mixer.current = null
      }
    }
  }, [animations, clonedScene, onLoaded, sceneIndex])

  useFrame((_, delta) => {
    mixer.current?.update(delta * 0.5)
  })

  return <primitive object={clonedScene} scale={scale} position={position} />
}