import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ModelProps {
  path: string
  scale?: number
  position?: [number, number, number]
}

export default function Model({ path, scale = 1, position = [0, 0, 0] }: ModelProps) {
  const { scene, animations } = useGLTF(path)
  const mixer = useRef<THREE.AnimationMixer | null>(null)

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene)
      animations.forEach((clip) => {
        mixer.current?.clipAction(clip).play()
      })
    }

    return () => {
      mixer.current?.stopAllAction()
      mixer.current?.uncacheRoot(scene)
      mixer.current = null
    }
  }, [animations, scene])

  useFrame((_, delta) => {
    mixer.current?.update(delta * 0.5)
  })

  return <primitive object={scene} scale={scale} position={position} />
}
