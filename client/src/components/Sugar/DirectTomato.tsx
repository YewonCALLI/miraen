import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useFrame } from '@react-three/fiber'

type GLTFResult = GLTF & {
  nodes: {
    Cherry_tomato2: THREE.Mesh
  }
  materials: {
    DefaultMaterial: THREE.MeshPhysicalMaterial
  }
}

interface DirectTomatoProps {
  startPosition?: [number, number, number]
  sugarConcentration?: number
  beakerRadius?: number
  waterLevel?: number
  beakerPosition?: [number, number, number]
  isDropped?: boolean
  onDrop?: () => void
  bottomY?: number // 바닥면 Y축 좌표를 조절 가능하게
  waterSurfaceOffset?: number // 물 진입 기준점 조절
}

export const DirectTomato: React.FC<DirectTomatoProps> = ({
  startPosition = [0, 2, 0],
  sugarConcentration = 0,
  beakerRadius = 0.32,
  waterLevel = 0.56,
  beakerPosition = [0, -0.6, 0],
  isDropped = false,
  onDrop,
  bottomY = -0.5, // 바닥면 기본값
  waterSurfaceOffset = 0.1, // 물 진입 기준 오프셋
}) => {
  const { nodes, materials } = useGLTF('models/Sugar/tomato1.glb') as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null!)

  const position = useRef(new THREE.Vector3(...startPosition))
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const hasDropped = useRef(false)

  const tomatoRadius = 0.08
  const GRAVITY = -2.0
  
  // 간단한 부력 계산: 설탕 농도가 높으면 부력이 강해짐
  const buoyancy = sugarConcentration > 10 ? 5.0 : 0  // 10g/100ml 이상에서 부력 발생, 강도 증가
  
  console.log(`토마토 설정: 농도=${sugarConcentration}g/100ml, 부력=${buoyancy}`);
  
  const getWaterSurfaceY = () => beakerPosition[1] + waterLevel
  const getBottomY = () => bottomY + tomatoRadius
  const getWaterEntryY = () => getWaterSurfaceY() - waterSurfaceOffset // 물 진입 기준점
  
  // 부력에 따른 목표 높이
  const getTargetY = () => {
    if (buoyancy > 0) {
      // 농도가 높을수록 더 높이 떠오름
      const floatHeight = (sugarConcentration - 10) * 0.01
      return getWaterEntryY() + 0.1 + floatHeight // 물 진입 기준점에서 떠오름
    }
    return getBottomY() // 가라앉음
  }
  
  const isInsideBeaker = (pos: THREE.Vector3) => {
    const dx = pos.x - beakerPosition[0]
    const dz = pos.z - beakerPosition[2]
    const distance = Math.hypot(dx, dz)
    const result = distance < beakerRadius - tomatoRadius
    
    if (hasDropped.current) {
      console.log(`비커 체크: pos(${pos.x.toFixed(2)}, ${pos.z.toFixed(2)}), beaker(${beakerPosition[0]}, ${beakerPosition[2]}), distance=${distance.toFixed(3)}, radius=${beakerRadius}, result=${result}`)
    }
    
    return result
  }

  const isInWater = (pos: THREE.Vector3) => {
    const inBeaker = isInsideBeaker(pos)
    const belowWater = pos.y < getWaterEntryY()
    const result = inBeaker && belowWater
    
    if (hasDropped.current && (inBeaker || belowWater)) {
      console.log(`물 체크: beaker=${inBeaker}, y=${pos.y.toFixed(3)}, waterEntry=${getWaterEntryY().toFixed(3)}, inWater=${result}`)
    }
    
    return result
  }

  useEffect(() => {
    if (isDropped && !hasDropped.current) {
      hasDropped.current = true
      position.current.set(...startPosition)
      velocity.current.set(
        0, // 수평 속도 제거 - 정확히 아래로만 떨어지게
        -0.5,
        0
      )
      onDrop?.()
    } else if (!isDropped) {
      hasDropped.current = false
      position.current.set(...startPosition)
      velocity.current.set(0, 0, 0)
    }
  }, [isDropped, startPosition, onDrop])

  useFrame((state, delta) => {
    if (!meshRef.current || !hasDropped.current) {
      if (meshRef.current) {
        meshRef.current.position.set(...startPosition)
      }
      return
    }

    const pos = position.current
    const vel = velocity.current

    if (isInWater(pos)) {
      console.log(`물 안에 있음! 부력=${buoyancy}, y위치=${pos.y.toFixed(3)}, 목표=${getTargetY().toFixed(3)}`);
      
      // 물 안에서
      if (buoyancy > 0) {
        // 부력이 있으면 즉시 위로 올라가는 힘
        vel.y += buoyancy * delta * 3.0  // 강한 부력으로 바로 떠오름
        console.log(`부력 적용! vel.y=${vel.y.toFixed(3)}`);
        
        const targetY = getTargetY()
        
        if (pos.y >= targetY - 0.05) {
          // 목표 높이 근처에서 bobbing
          const bobbing = Math.sin(state.clock.elapsedTime * 2) * 0.02
          pos.y = targetY + bobbing
          vel.y = bobbing * 0.5
        }
      } else {
        // 부력이 없으면 바닥으로
        vel.y += GRAVITY * delta
      }
      
      vel.multiplyScalar(0.85) // 물의 저항
    } else {
      // 공기 중에서는 중력만
      vel.y += GRAVITY * delta
      vel.multiplyScalar(0.98)
    }

    // 위치 업데이트
    pos.addScaledVector(vel, delta)

    // 바닥 충돌 체크 (부력이 없을 때만)
    if (buoyancy === 0 && pos.y <= getBottomY()) {
      pos.y = getBottomY()
      vel.y = 0
    }

    // 비커 벽면 충돌
    if (isInsideBeaker(pos)) {
      const dx = pos.x - beakerPosition[0]
      const dz = pos.z - beakerPosition[2]
      const distance = Math.hypot(dx, dz)
      
      if (distance > beakerRadius - tomatoRadius) {
        const normal = new THREE.Vector3(dx, 0, dz).normalize()
        pos.x = beakerPosition[0] + normal.x * (beakerRadius - tomatoRadius) * 0.9
        pos.z = beakerPosition[2] + normal.z * (beakerRadius - tomatoRadius) * 0.9
        vel.x *= -0.3
        vel.z *= -0.3
      }
    }

    // 메시 업데이트
    meshRef.current.position.copy(pos)
    meshRef.current.rotation.x += vel.y * delta * 0.5
    meshRef.current.rotation.z += vel.x * delta * 0.5
  })

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      geometry={nodes.Cherry_tomato2.geometry}
      rotation={[Math.PI / 2, 0, 0]}
      material={materials.DefaultMaterial}
      scale={6 * 0.01}
    />
  )
}

useGLTF.preload('models/Sugar/tomato1.glb')