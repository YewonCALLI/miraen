// src/components/ConstellationLayer.tsx

import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ConstellationLayerProps {
  activeSeason: string | null
  enableInteraction: boolean
  fadeOut?: boolean
  // 외부에서 회전을 제어하기 위한 props 추가
  rotationX?: number
  rotationY?: number
}

export function ConstellationLayer({
  activeSeason,
  enableInteraction,
  fadeOut = false,
  rotationX = 0,
  rotationY = 0,
}: ConstellationLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const opacity = useRef(0)

  // 계절이 변경되면 회전 초기화
  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.set(0, 0, 0)
    opacity.current = fadeOut ? 1 : 0
  }, [activeSeason, fadeOut])

  // 페이드 인/아웃 효과
  useFrame(() => {
    if (!meshRef.current) return
    if (fadeOut) {
      opacity.current = THREE.MathUtils.lerp(opacity.current, 0, 0.02)
    } else if (activeSeason) {
      opacity.current = THREE.MathUtils.lerp(opacity.current, 1, 0.02)
    }
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity.current
    
    // 외부에서 전달받은 회전값 적용 (enableInteraction이 true일 때만)
    if (enableInteraction && rotationX !== undefined && rotationY !== undefined) {
      meshRef.current.rotation.x = rotationX;
      meshRef.current.rotation.y = rotationY;
    }
  })

  // 별자리 텍스처 로드
  const texturePath = '/textures/constellation_figures_64k_2 1.png'
  const tex = useMemo(
    () => (activeSeason ? new THREE.TextureLoader().load(texturePath) : null),
    [activeSeason]
  )
  if (!tex) return null

  return (
    <mesh 
      ref={meshRef}
      scale={[300, 300, 300]}
      raycast={() => null}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        map={tex}
        color={new THREE.Color(0.9, 0.9, 0.9).multiplyScalar(0.7)}
        side={THREE.BackSide}
        transparent
        opacity={0}
      />
    </mesh>
  )
}