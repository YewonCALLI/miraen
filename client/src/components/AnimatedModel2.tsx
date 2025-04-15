import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations, Text } from '@react-three/drei'
import { Group, Object3D, Vector3, Mesh, Material, MeshStandardMaterial, LineSegments } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Props = {
  url: string
  scale?: number
  actionName: 'extend' | 'fold'
  position?: [number, number, number]
  lineTargetPosA?: [number, number, number]
  lineTargetPosB?: [number, number, number]
}

export default function AnimatedModel2({
  url,
  scale = 1,
  actionName,
  position = [0, 0, 0],
  lineTargetPosA = [-0.03, 0.01, -0.03],
  lineTargetPosB = [0.03, -0.03, 0.09],
}: Props) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, group)

  const armRefA = useRef<Object3D>(null)
  const armRefB = useRef<Object3D>(null)
  const textRefA = useRef<Object3D>(null)
  const textRefB = useRef<Object3D>(null)
  const lineRefA = useRef<LineSegments>(null)
  const lineRefB = useRef<LineSegments>(null)

  const textOffsetA = new THREE.Vector3(-0.1, 0.20, -0.02)
  const textOffsetB = new THREE.Vector3(0.03, -0.03, 0.09)

  const prevTextPosA = useRef(new THREE.Vector3())
  const prevTextPosB = useRef(new THREE.Vector3())

  const [armReady, setArmReady] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const forceHighlightColor = (mesh: Mesh, color: string) => {
    const apply = (mat: Material | null | undefined) => {
      if (!mat || typeof mat.clone !== 'function') return mat
      const cloned = mat.clone()
      if (cloned instanceof MeshStandardMaterial) {
        cloned.color.set(color)
        cloned.emissive.set(color)
        cloned.emissiveIntensity = 1.0
        cloned.map = null
        cloned.roughnessMap = null
        cloned.metalnessMap = null
        cloned.normalMap = null
        cloned.bumpMap = null
        cloned.aoMap = null
        cloned.alphaMap = null
      }
      return cloned
    }

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(apply)
    } else {
      mesh.material = apply(mesh.material)
    }
  }

  useEffect(() => {
    if (!actions || animations.length === 0) return

    const clip = animations[0]
    const action = actions[clip.name]
    if (!action) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    action.stop()
    action.reset()
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true

    const halfDuration = clip.duration / 2

    if (actionName === 'extend') {
      action.time = 0
      action.play()
      intervalRef.current = setInterval(() => {
        if (action.time >= halfDuration) {
          action.paused = true
          clearInterval(intervalRef.current!)
        }
      }, 16)
    }

    if (actionName === 'fold') {
      action.time = halfDuration
      action.play()
      intervalRef.current = setInterval(() => {
        if (action.time >= clip.duration) {
          action.paused = true
          clearInterval(intervalRef.current!)
        }
      }, 16)
    }

    return () => {
      action.stop()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [actions, animations, actionName])

  useEffect(() => {
    if (!scene) return

    const muscle = scene.getObjectByName('Arm_Muscle') as Mesh
    const bone = scene.getObjectByName('Arm_Skeleton') as Mesh

    if (muscle) forceHighlightColor(muscle, 'red')
    if (bone) forceHighlightColor(bone, 'blue')
  }, [scene])

  useEffect(() => {
    const arms: Object3D[] = []
    scene.traverse((obj) => {
      obj.frustumCulled = false
      if (obj.name.toLowerCase().includes('arm')) {
        arms.push(obj)
      }
    })
    if (arms.length >= 2) {
      armRefA.current = arms[0]
      armRefB.current = arms[1]
      setArmReady(true)
    }
  }, [scene])

  useFrame(({ camera }) => {
    if (!armReady) return

    const updateTextAndLine = (
      armRef: Object3D | null,
      textRef: Object3D | null,
      lineRef: THREE.LineSegments | null,
      offset: THREE.Vector3,
      prevPosRef: React.MutableRefObject<THREE.Vector3>,
      customStart: [number, number, number]
    ) => {
      if (!armRef || !textRef || !lineRef) return

      const armWorldPos = new THREE.Vector3()
      const targetTextPos = new THREE.Vector3()

      armRef.getWorldPosition(armWorldPos)
      targetTextPos.copy(armWorldPos).add(offset)

      prevPosRef.current.lerp(targetTextPos, 0.1)
      textRef.position.copy(prevPosRef.current)
      textRef.lookAt(camera.position)

      const start = new THREE.Vector3(...customStart)
      lineRef.geometry.setFromPoints([start, prevPosRef.current])
    }

    updateTextAndLine(armRefA.current, textRefA.current, lineRefA.current, textOffsetA, prevTextPosA, lineTargetPosA)
    updateTextAndLine(armRefB.current, textRefB.current, lineRefB.current, textOffsetB, prevTextPosB, lineTargetPosB)
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
          <group>
            <Text
              ref={textRefA}
              font="/fonts/NoonnuBasicGothicRegular.ttf"
              fontSize={0.005}
              color="black"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
              material-depthTest={false}
            >
              {getBalloonText(true)}
            </Text>
            <lineSegments ref={lineRefA}>
              <bufferGeometry />
              <lineBasicMaterial color="black" />
            </lineSegments>
          </group>

          <group>
            <Text
              ref={textRefB}
              font="/fonts/NoonnuBasicGothicRegular.ttf"
              fontSize={0.005}
              color="black"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
              material-depthTest={false}
            >
              {getBalloonText(false)}
            </Text>
            <lineSegments ref={lineRefB}>
              <bufferGeometry />
              <lineBasicMaterial color="black" />
            </lineSegments>
          </group>
        </>
      )}
    </>
  )
}
