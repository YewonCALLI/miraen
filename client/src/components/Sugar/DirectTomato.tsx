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
  sugarConcentration?: number // 설탕 농도 (g/100ml)
  beakerRadius?: number
  waterLevel?: number // 물의 높이
  beakerPosition?: [number, number, number]
  isDropped?: boolean
  onDrop?: () => void
}

export const DirectTomato: React.FC<DirectTomatoProps> = ({
  startPosition = [0, 2, 0],
  sugarConcentration = 0,
  beakerRadius = 0.32,
  waterLevel = 0.56,
  beakerPosition = [0, -0.6, 0],
  isDropped = false,
  onDrop,
}) => {
  const { nodes, materials } = useGLTF('models/Sugar/tomato1.glb') as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null!)

  // 상태
  const position = useRef(new THREE.Vector3(...startPosition))
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const isInWater = useRef(false)
  const hasDropped = useRef(false)
  const hasHitBottom = useRef(false)
  const shouldFloat = useRef(false)

  // 물리 상수
  const GRAVITY = -1.8
  const WATER_DRAG = 0.88
  const AIR_DRAG = 0.98
  const BOUNCE_FACTOR = 0.2

  // 토마토 속성
  const tomatoRadius = 0.08
  const FLOAT_THRESHOLD = 15.0
  const willFloat = sugarConcentration >= FLOAT_THRESHOLD

  useEffect(() => {
    if (isDropped && !hasDropped.current) {
      hasDropped.current = true
      hasHitBottom.current = false
      shouldFloat.current = willFloat

      position.current.set(...startPosition)
      velocity.current.set((Math.random() - 0.5) * 0.2, -0.3, (Math.random() - 0.5) * 0.2)
      onDrop?.()
    } else if (!isDropped && hasDropped.current) {
      hasDropped.current = false
      isInWater.current = false
      hasHitBottom.current = false
      shouldFloat.current = false
      position.current.set(...startPosition)
      velocity.current.set(0, 0, 0)
    }
  }, [isDropped, startPosition, onDrop, willFloat])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // 아직 드롭되지 않으면 고정
    if (!hasDropped.current) {
      meshRef.current.position.set(...startPosition)
      return
    }

    const pos = position.current
    const vel = velocity.current

    // sinking인 경우, 바닥에 한번 닿으면 완전히 멈춤
    if (!shouldFloat.current && hasHitBottom.current) {
      const bottomY = beakerPosition[1] - 0.15 + tomatoRadius
      pos.y = bottomY
      vel.set(0, 0, 0)
      meshRef.current.position.copy(pos)
      return
    }

    // 비커 및 물 판단
    const dx = pos.x - beakerPosition[0]
    const dz = pos.z - beakerPosition[2]
    const distanceFromCenter = Math.hypot(dx, dz)
    const insideBeaker = distanceFromCenter < beakerRadius - tomatoRadius
    const waterSurfaceY = beakerPosition[1] + waterLevel
    const atWaterLevel = pos.y <= waterSurfaceY - tomatoRadius * 0.3
    const currentlyInWater = insideBeaker && atWaterLevel

    // 물 진입/이탈
    if (currentlyInWater && !isInWater.current) {
      isInWater.current = true
      vel.multiplyScalar(0.4)
    } else if (!currentlyInWater && isInWater.current) {
      isInWater.current = false
    }

    // 물리 연산
    if (currentlyInWater) {
      if (shouldFloat.current) {
        // 부양하는 토마토
        const targetY = waterSurfaceY - tomatoRadius * 0.6
        if (hasHitBottom.current && pos.y >= targetY) {
          // 목표 부양 높이 도달 시 고정 + bobbing
          console.log('Bobbing at target height:', targetY)
          const bob = Math.sin(state.clock.elapsedTime * 2) * 0.015
          pos.y = targetY + bob
          vel.set(0, 0, 0)
        } else {
          // 목표 높이 이전에는 부력 적용
          vel.y += Math.abs(GRAVITY) * delta
          vel.multiplyScalar(WATER_DRAG * 0.5)
          pos.addScaledVector(vel, delta)
        }
      } else {
        // 가라앉는 토마토
        vel.y += GRAVITY * delta
        vel.multiplyScalar(WATER_DRAG)
        pos.addScaledVector(vel, delta)
      }
    } else {
      // 공기 중
      vel.y += GRAVITY * delta
      vel.multiplyScalar(AIR_DRAG)
      pos.addScaledVector(vel, delta)
    }

    // 벽 충돌
    if (insideBeaker && distanceFromCenter > beakerRadius - tomatoRadius) {
      const dir = new THREE.Vector3(dx, 0, dz).normalize()
      pos.x = beakerPosition[0] + dir.x * (beakerRadius - tomatoRadius) * 0.9
      pos.z = beakerPosition[2] + dir.z * (beakerRadius - tomatoRadius) * 0.9
      const radialV = vel.x * dir.x + vel.z * dir.z
      if (radialV > 0) {
        vel.x -= dir.x * radialV * (1 + BOUNCE_FACTOR)
        vel.z -= dir.z * radialV * (1 + BOUNCE_FACTOR)
      }
    }

    // 바닥 충돌
    if (insideBeaker) {
      const bottomY = beakerPosition[1] - 0.15 + tomatoRadius
      if (pos.y < bottomY) {
        pos.y = bottomY
        if (!hasHitBottom.current) {
          hasHitBottom.current = true
        }
        if (!shouldFloat.current) {
          // sinking: 멈춤
          vel.set(0, 0, 0)
        } else {
          // floating: 살짝 튕겨올라옴
          vel.y = Math.abs(vel.y) * 0.5 + 1.5
        }
      }
    }

    // 전체 경계 제한
    if (pos.length() > 2.5) {
      pos.normalize().multiplyScalar(2.5)
      vel.set(0, 0, 0)
    }
    // 상단 제한
    const maxY = startPosition[1] + 0.3
    if (pos.y > maxY) {
      pos.y = maxY
      vel.y = Math.min(0, vel.y)
    }

    // 메시 업데이트
    meshRef.current.position.copy(pos)
    const rotSpeed = currentlyInWater ? 0.2 : 0.8
    meshRef.current.rotation.x += vel.y * delta * rotSpeed
    meshRef.current.rotation.z += vel.x * delta * rotSpeed
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
