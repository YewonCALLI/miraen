// src/components/SpaceObjects.tsx

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// 태양
export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null!)
  const sunTexture = useTexture('/models/earth/sun_texture.jpeg')
  useFrame((_, delta) => {
    sunRef.current.rotation.y += 0.05 * delta
  })
  return (
    <mesh ref={sunRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        map={sunTexture || undefined}
        emissive="orange"
        emissiveIntensity={0.8}
        emissiveMap={sunTexture || undefined}
      />
    </mesh>
  )
}

// 별
export function Stars() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(6000)
    for (let i = 0; i < 2000; i++) {
      pos.set(
        [(Math.random() - 0.5) * 100,
         (Math.random() - 0.5) * 100,
         (Math.random() - 0.5) * 100],
        i * 3
      )
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <points geometry={geom}>
      <pointsMaterial color="white" size={0.05} />
    </points>
  )
}

// 위도/경도 → 벡터 변환
function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const φ = (90 - lat) * (Math.PI / 180)
  const θ = (lon + 180) * (Math.PI / 180)
  return [
    -radius * Math.sin(φ) * Math.cos(θ),
    radius * Math.cos(φ),
    radius * Math.sin(φ) * Math.sin(θ),
  ]
}

// 지구 모델 + 팬로라마 구체
export function EarthModel({
  position,
  onClick,
  fadeReady,
  season,
}: {
  position: [number, number, number]
  onClick: () => void
  fadeReady: boolean
  season: string
}) {
  const seasonAngles: Record<string, number> = {
    spring: -Math.PI / 2,
    summer: Math.PI,
    fall:   Math.PI / 2,
    winter: 0,
  }

  // 모델 로드
  const { scene: earthScene } = useGLTF('/models/earth/earth.gltf')
  const { scene: figureScene } = useGLTF('/models/earth/Figure.gltf')

  // 사람 위치 계산
  const lat = 50.5665
  const lon = 90.0
  const surfaceRadius = 0.4
  const figurePos = useMemo(
    () => latLonToVector3(lat, lon, surfaceRadius),
    []
  )

  // 파노라마 텍스처 & 위치
  const panoTex = useTexture('/textures/Panorama 1.png')
  const panoPos = useMemo<[number, number, number]>(
    () => [figurePos[0], figurePos[1], figurePos[2]],
    [figurePos]
  )

  // 회전 그룹
  const groupRef = useRef<THREE.Group>(null!)
  const targetAngle = seasonAngles[season] || 0

  useFrame((_, delta) => {
    if (!fadeReady) {
      // 계속 자전
      groupRef.current.rotation.y += 0
    } else {
      // 선택 계절 각도로 고정
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetAngle,
        5,
        delta
      )
    }
  })

  return (
    <group position={position} ref={groupRef} onClick={onClick}>
      {/* 지구 */}
      {!fadeReady && (
        <primitive object={earthScene.clone()} scale={[0.08, 0.08, 0.08]} />
      )}

      {/* 사람 */}
      <group position={figurePos}>
        <primitive object={figureScene.clone()} scale={[0.003, 0.003, 0.003]} />
      </group>

      {/* 파노라마 구체 */}
      {fadeReady && (
        <mesh position={[panoPos[0], panoPos[1]-0.04, panoPos[2]]} scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[1, 128, 128]} />
          <meshBasicMaterial
            map={panoTex}
            side={THREE.DoubleSide}
            transparent={true}
            alphaTest={0.2}
          />
          <spotLight
            position={[figurePos[0], figurePos[1] - 0.1, figurePos[2]]}
            target-position={[figurePos[0], panoPos[1], figurePos[2]]} // 위를 향하도록
            angle={0.5}
            penumbra={0.9}
            intensity={5}
            distance={1.2}
            color="#ff0000"
          />

        </mesh>
        
      )}
    </group>
  )
}
