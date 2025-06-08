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
  waterLevel?: number // 물의 높이 (0.56m)
  beakerPosition?: [number, number, number]
  isDropped?: boolean
  onDrop?: () => void
}

export const DirectTomato: React.FC<DirectTomatoProps> = ({
  startPosition = [0, 2, 0],
  sugarConcentration = 0, // 설탕 농도 (g/100ml)
  beakerRadius = 0.32,
  waterLevel = 0.56,
  beakerPosition = [0, -0.6, 0],
  isDropped = false,
  onDrop,
}) => {
  const { nodes, materials } = useGLTF('models/Sugar/tomato1.glb') as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null!)

  // 토마토 상태
  const position = useRef(new THREE.Vector3(...startPosition))
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const isInWater = useRef(false)
  const hasDropped = useRef(false)

  // 물리 상수
  const GRAVITY = -2.5
  const WATER_DRAG = 0.92
  const AIR_DRAG = 0.99
  const BOUNCE_FACTOR = 0.3

  // 토마토 물리 속성 (크기 6배에 맞춰 조정)
  const tomatoRadius = 0.12 // 0.02에서 0.12로 증가 (6배)
  const tomatoDensity = 0.95 // 토마토 밀도 (g/cm³) - 물보다 살짝 가벼움

  // 설탕 농도에 따른 물의 밀도 계산
  // 설탕 1g/100ml당 물의 밀도가 약 0.004 g/cm³ 증가
  const waterDensity = 1.0 + sugarConcentration * 0.004 // g/cm³

  // 부력 계산 (토마토가 뜨는지 가라앉는지)
  const buoyancyRatio = waterDensity / tomatoDensity // 1보다 크면 뜸, 작으면 가라앉음

  // 부력의 강도 계산 - 밀도 차이에 비례하여 부력 조정
  const densityDifference = waterDensity - tomatoDensity
  const buoyancyForce = densityDifference * 3.5 // 부력 계수를 3.5로 조정 (큰 토마토에 맞춰)

  console.log(`토마토 물리 상태:
    설탕농도: ${sugarConcentration.toFixed(1)}g/100ml
    물밀도: ${waterDensity.toFixed(3)}g/cm³
    토마토밀도: ${tomatoDensity}g/cm³
    밀도차이: ${densityDifference.toFixed(3)}g/cm³
    부력비율: ${buoyancyRatio.toFixed(3)}
    부력크기: ${buoyancyForce.toFixed(3)}
    ${buoyancyRatio > 1 ? '🟢 토마토가 뜰 것임' : '🔴 토마토가 가라앉을 것임'}`)

  // 드롭 상태 변경 처리
  useEffect(() => {
    if (isDropped && !hasDropped.current) {
      console.log('🍅 토마토 드롭 시작!')
      hasDropped.current = true

      // 시작 위치와 속도 설정
      position.current.set(...startPosition)
      velocity.current.set(
        (Math.random() - 0.5) * 0.3, // 약간의 수평 랜덤
        -0.5, // 초기 하강 속도
        (Math.random() - 0.5) * 0.3,
      )

      onDrop?.()
    } else if (!isDropped && hasDropped.current) {
      // 리셋
      console.log('🍅 토마토 리셋')
      hasDropped.current = false
      isInWater.current = false
      position.current.set(...startPosition)
      velocity.current.set(0, 0, 0)
    }
  }, [isDropped, startPosition, onDrop])

  // 물리 시뮬레이션
  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (!hasDropped.current) {
      // 드롭되지 않은 상태: 고정 위치
      meshRef.current.position.set(...startPosition)
      return
    }

    const pos = position.current
    const vel = velocity.current

    // 비커 관련 계산 (토마토 크기 고려)
    const distanceFromCenter = Math.sqrt(
      Math.pow(pos.x - beakerPosition[0], 2) + Math.pow(pos.z - beakerPosition[2], 2),
    )

    const isInsideBeaker = distanceFromCenter < beakerRadius - tomatoRadius * 0.5 // 토마토 반지름 절반만큼 여유
    const isAtWaterLevel = pos.y <= beakerPosition[1] + waterLevel - tomatoRadius * 0.5 // 토마토 중심이 물 아래
    const currentlyInWater = isInsideBeaker && isAtWaterLevel

    // 물 진입/이탈 감지
    if (currentlyInWater && !isInWater.current) {
      console.log(
        `💧 토마토가 물에 들어감! (농도: ${sugarConcentration.toFixed(1)}g/100ml, 밀도: ${waterDensity.toFixed(
          3,
        )}g/cm³)`,
      )
      isInWater.current = true
    } else if (!currentlyInWater && isInWater.current) {
      console.log('🌊 토마토가 물에서 나옴')
      isInWater.current = false
    }

    // 중력과 부력 적용
    if (currentlyInWater) {
      // 물속: 부력 적용
      vel.y += (GRAVITY + buoyancyForce) * delta
      vel.multiplyScalar(WATER_DRAG) // 물의 저항
    } else {
      // 공기 중: 중력만
      vel.y += GRAVITY * delta
      vel.multiplyScalar(AIR_DRAG) // 공기 저항
    }

    // 위치 업데이트
    pos.addScaledVector(vel, delta)

    // 비커 벽 충돌 먼저 처리 (더 강력하게, 큰 토마토 고려)
    const effectiveBeakerRadius = beakerRadius - tomatoRadius // 토마토 반지름만큼 여유
    if (distanceFromCenter > effectiveBeakerRadius) {
      // 벽에 부딪힘 - 토마토를 비커 중앙 방향으로 강제 이동
      const centerToTomato = new THREE.Vector3(pos.x - beakerPosition[0], 0, pos.z - beakerPosition[2])

      if (centerToTomato.length() > 0.001) {
        // 0으로 나누기 방지
        centerToTomato.normalize()

        // 토마토를 비커 안쪽으로 강제 이동 (토마토 크기 고려)
        pos.x = beakerPosition[0] + centerToTomato.x * effectiveBeakerRadius * 0.9
        pos.z = beakerPosition[2] + centerToTomato.z * effectiveBeakerRadius * 0.9

        // 벽을 향하는 속도 성분을 반사
        const radialVelocity = vel.x * centerToTomato.x + vel.z * centerToTomato.z
        if (radialVelocity > 0) {
          // 벽을 향해 가고 있다면
          vel.x -= centerToTomato.x * radialVelocity * (1 + BOUNCE_FACTOR)
          vel.z -= centerToTomato.z * radialVelocity * (1 + BOUNCE_FACTOR)
        }

        console.log('🚧 토마토가 비커 벽에 부딪혀 반사됨')
      }
    }

    // 비커 바닥 충돌 처리 (토마토 크기 고려)
    if (distanceFromCenter < beakerRadius) {
      // 비커 내부에 있을 때만
      const bottomY = beakerPosition[1] - 0.25 + tomatoRadius // 토마토 반지름만큼 위로
      if (pos.y < bottomY) {
        pos.y = bottomY
        vel.y = Math.abs(vel.y) * BOUNCE_FACTOR // 튕김
        console.log('🛑 토마토가 비커 바닥에 부딪힘')
      }
    }

    // 토마토가 너무 멀리 가지 않도록 전체적인 경계 설정
    const maxDistance = 3.0 // 원점에서 최대 거리
    if (pos.length() > maxDistance) {
      pos.normalize().multiplyScalar(maxDistance)
      vel.set(0, 0, 0) // 속도 초기화
      console.log('⚠️ 토마토가 너무 멀리 가서 리셋됨')
    }

    // 토마토가 너무 높이 올라가지 않도록 제한
    if (pos.y > startPosition[1] + 0.5) {
      pos.y = startPosition[1] + 0.5
      vel.y = Math.min(0, vel.y)
    }

    // 메시 위치 업데이트
    meshRef.current.position.copy(pos)

    // 토마토에 약간의 회전 추가 (더 자연스럽게)
    meshRef.current.rotation.x += vel.y * delta * 0.5
    meshRef.current.rotation.z += vel.x * delta * 0.5
  })

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      geometry={nodes.Cherry_tomato2.geometry}
      rotation={[Math.PI / 2, 0, 0]} // ← X축 기준으로 –90°(–π/2) 회전
      material={materials.DefaultMaterial}
      scale={6 * 0.01} // 다른 토마토들과 같은 크기로
    />
  )
}

useGLTF.preload('models/Sugar/tomato1.glb')
