import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Group } from 'three'
import * as THREE from 'three'

interface AnimatedModelProps {
  url: string
  animIndex?: number
  scale?: number
  position?: [number, number, number]
  loop?: boolean
  removeMuscleLayer?: boolean
}

export default function AnimatedModel({
  url,
  animIndex = 0,
  scale = 1,
  position = [0, 0, 0],
  loop = true,
  removeMuscleLayer = false,
}: AnimatedModelProps) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions, mixer } = useAnimations(animations, group)

  useEffect(() => {
    if (!animations || animations.length === 0) return

    const clip = animations[animIndex] || animations[0]
    const action = mixer.clipAction(clip, group.current!)

    mixer.stopAllAction()
    action.reset().play()
    action.setLoop(THREE.LoopRepeat, Infinity)
    return () => {
      action?.stop()
    }
  }, [url, animIndex, animations, mixer, loop])

  // 뼈 모드일 때 Muscle layer 제거 (scene.children[0].children[2])
  useEffect(() => {
    if (removeMuscleLayer && scene.children[0]?.children[2]) {
      const target = scene.children[0].children[2]
      scene.children[0].remove(target)
    }
  }, [scene, removeMuscleLayer])

  return (
    <group ref={group} scale={scale} position={position}>
      <primitive object={scene} />
    </group>
  )
}
