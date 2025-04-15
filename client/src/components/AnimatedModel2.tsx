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
  lineTargetPosA = [-0.03, 0.01, -0.02],
  lineTargetPosB = [0.03, -0.01, 0.00],
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

  const textOffsetA = new THREE.Vector3(-0.05, 0.23, -0.05)
  const textOffsetB = new THREE.Vector3(-0.005, 0.2, 0.03)

  const prevTextPosA = useRef(new THREE.Vector3())
  const prevTextPosB = useRef(new THREE.Vector3())

  const [armReady, setArmReady] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const redTargetRef = useRef<Mesh>(null)
  const blueTargetRef = useRef<Mesh>(null)

  const forceHighlightColor = (mesh: Mesh, color: string) => {
    const apply = (mat: Material | null | undefined) => {
      if (!mat || typeof mat.clone !== 'function') return mat
      const cloned = mat.clone()
      if (cloned instanceof MeshStandardMaterial) {
        cloned.emissive.set(color)
        cloned.emissiveIntensity = 0.6
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
    if (!scene || !group.current) return
    
    // 정확한 위치에 있는 메시 찾기
    const meshA = scene.children[1]?.children[4] as Mesh
    const meshB = scene.children[1]?.children[2] as Mesh
    
    if (meshA && meshB) {
      console.log('Found meshA:', meshA.name, 'and meshB:', meshB.name)
      redTargetRef.current = meshA
      blueTargetRef.current = meshB
      
      // 메시가 속한 전체 계층 구조 확인
      console.log('MeshA parent hierarchy:', meshA.parent?.name, meshA.parent?.parent?.name)
      console.log('MeshB parent hierarchy:', meshB.parent?.name, meshB.parent?.parent?.name)
    } else {
      console.warn('Could not find target meshes at specified indices')
      
      // 디버깅: 씬 구조 출력
      console.log('Scene structure:')
      scene.traverse((obj) => {
        console.log(`- ${obj.name} (${obj.type}) - parent: ${obj.parent?.name || 'none'}`)
      })
    }
  }, [scene, group])
  

  useEffect(() => {
    const meshA = redTargetRef.current
    const meshB = blueTargetRef.current
  
    if (!meshA || !meshB) return
  
    if (actionName === 'fold') {
      forceHighlightColor(meshA, 'red')
      forceHighlightColor(meshB, 'blue')
    } else {
      forceHighlightColor(meshA, 'blue')
      forceHighlightColor(meshB, 'red')
    }
  }, [actionName])
  

  useEffect(() => {
    const arms: Object3D[] = []
    scene.traverse((obj) => {
      obj.frustumCulled = false
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true // 필요하면
      }
      
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
      startPosition: [number, number, number]
    ) => {
      if (!armRef || !textRef || !lineRef) return
  
      const armWorldPos = new THREE.Vector3()
      const targetTextPos = new THREE.Vector3()
      const startWorldPos = new THREE.Vector3(...startPosition)
  
      armRef.updateMatrixWorld(true)
      armRef.getWorldPosition(armWorldPos)
  
      targetTextPos.copy(armWorldPos).add(offset)
      prevPosRef.current.lerp(targetTextPos, 0.1)
      textRef.position.copy(prevPosRef.current)
      textRef.lookAt(camera.position)
  
      lineRef.geometry.setFromPoints([startWorldPos, prevPosRef.current])
    }
  
    updateTextAndLine(
      armRefA.current,
      textRefA.current,
      lineRefA.current,
      textOffsetA,
      prevTextPosA,
      lineTargetPosA
    )
  
    updateTextAndLine(
      armRefB.current,
      textRefB.current,
      lineRefB.current,
      textOffsetB,
      prevTextPosB,
      lineTargetPosB
    )
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
    <group ref={group} scale={scale} position={position}>
      <primitive object={scene} />
    </group>

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