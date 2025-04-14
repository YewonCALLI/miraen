import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations, Text } from '@react-three/drei'
import { Group, Object3D, Vector3 } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Props = {
  url: string
  scale?: number
  actionName: 'extend' | 'fold'
  position?: [number, number, number]
}

export default function AnimatedModel2({ url, scale = 1, actionName, position = [0, 0, 0] }: Props) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, group)

    const armRefA = useRef<Object3D>(null)
    const armRefB = useRef<Object3D>(null)
    const textRefA = useRef<Object3D>(null)
    const textRefB = useRef<Object3D>(null)
    const lineRefA = useRef<THREE.Line>(null)
    const lineRefB = useRef<THREE.Line>(null)

    const textOffsetA = new THREE.Vector3(-0.04, 0.01, -0.02)
    const textOffsetB = new THREE.Vector3(0.03, -0.03, 0.09)

    const prevTextPosA = useRef(new THREE.Vector3())
    const prevTextPosB = useRef(new THREE.Vector3())

  const [armReady, setArmReady] = useState(false)
  const start = new Vector3()
const offset = new Vector3(0, -0.01, 0)

  useEffect(() => {
    if (!actions || animations.length === 0) return

    const clip = animations[0]
    const action = actions[clip.name]
    if (!action) return

    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.clampWhenFinished = true

    const halfDuration = clip.duration / 2

    if (actionName === 'extend') {
      action.time = 0
      action.play()
      const stopAt = halfDuration
      const id = setInterval(() => {
        if (action.time >= stopAt) {
          action.paused = true
          clearInterval(id)
        }
      }, 16)
    }

    if (actionName === 'fold') {
      action.time = halfDuration
      action.play()
      const stopAt = clip.duration
      const id = setInterval(() => {
        if (action.time >= stopAt) {
          action.paused = true
          clearInterval(id)
        }
      }, 16)
    }
    

    return () => {
      action.stop()
    }
  }, [actions, animations, actionName])

  useEffect(() => {
    const arms: Object3D[] = []
    scene.traverse((obj) => {
      obj.frustumCulled = false
      if (obj.name.toLowerCase().includes('arm')) {
        arms.push(obj)
      }
    })
    if (arms.length >= 2) {
      armRefA.current = arms[1]
      armRefB.current = arms[1]
      setArmReady(true)
    }

  }, [scene])


  useFrame(({ camera }) => {
    if (!armReady) return
  
    const updateTextAndLine = (
      armRef: Object3D | null,
      textRef: Object3D | null,
      lineRef: THREE.Line | null,
      offset: THREE.Vector3,
      prevPosRef: React.MutableRefObject<THREE.Vector3>
    ) => {
      if (!armRef || !textRef || !lineRef) return
  
      const armWorldPos = new THREE.Vector3()
      const targetTextPos = new THREE.Vector3()
  
      armRef.getWorldPosition(armWorldPos)
      targetTextPos.copy(armWorldPos).add(offset)
  
      prevPosRef.current.lerp(targetTextPos, 0.1) // 0.1은 부드러움 정도
      textRef.position.copy(prevPosRef.current)
  
      textRef.lookAt(camera.position)
  
      // 선 연결
      lineRef.geometry.setFromPoints([armWorldPos, prevPosRef.current])
    }
  
    updateTextAndLine(armRefA.current, textRefA.current, lineRefA.current, textOffsetA, prevTextPosA)
    updateTextAndLine(armRefB.current, textRefB.current, lineRefB.current, textOffsetB, prevTextPosB)
  })
  

  const getBalloonText = (isA: boolean) => {
    if (actionName === 'extend') {
      return isA ? '근육이 늘어나요' : '근육이 줄어들어요'
    } else {
      return isA ? '근육이 줄어들어요' : '근육이 늘어나요'
    }
  }

  return (
    <>
      <primitive ref={group} object={scene} scale={scale} position={position} />

      {armReady && (
        <>
          {/* 독립된 텍스트와 선 */}
          <group>
            <Text
              ref={textRefA}
              font="/fonts/Pretendard-SemiBold.ttf"
              fontSize={0.005}
              color="black"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
              material-depthTest={false}
            >
              {getBalloonText(true)}
            </Text>
            <line ref={lineRefA}>
              <bufferGeometry />
              <lineBasicMaterial color="black" />
            </line>
          </group>

          <group>
            <Text
              ref={textRefB}
              font="/fonts/Pretendard-SemiBold.ttf"
              fontSize={0.005}
              color="black"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
              material-depthTest={false}
            >
              {getBalloonText(true)}
            </Text>

            <line ref={lineRefB}>
              <bufferGeometry />
              <lineBasicMaterial color="black" />
            </line>
          </group>
        </>
      )}
    </>
  )
}
