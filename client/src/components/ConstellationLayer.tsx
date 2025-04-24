// components/ConstellationLayer.tsx
import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ConstellationLayerProps {
  activeSeason: string | null
  enableInteraction: boolean
  fadeOut?: boolean
}

export function ConstellationLayer({
  activeSeason,
  enableInteraction,
  fadeOut = false,
}: ConstellationLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const opacity = useRef(0)
  const { gl, camera } = useThree()
  const lastPos = useRef<[number, number]>([0, 0])
  const dragging = useRef(false)

  // 시즌 변경 시 회전·불투명도 초기화
  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.set(0, 0, 0)
    opacity.current = fadeOut ? 1 : 0
  }, [activeSeason, fadeOut])

  // 매 프레임마다 fadeIn / fadeOut
  useFrame(() => {
    if (!meshRef.current) return

    if (fadeOut) {
      // 복원 애니메이션 중엔 1 → 0
      opacity.current = THREE.MathUtils.lerp(opacity.current, 0, 0.02)
    } else if (activeSeason) {
      // 활성화 시엔 0 → 1
      opacity.current = THREE.MathUtils.lerp(opacity.current, 1, 0.02)
    }

    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = opacity.current
  })

  // 드래그로 상하좌우 회전
  useEffect(() => {
    if (!enableInteraction) return

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastPos.current = [e.clientX, e.clientY]
    }
    const onUp = () => {
      dragging.current = false
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !meshRef.current) return
      const [lx, ly] = lastPos.current
      const dx = (e.clientX - lx) * 0.005
      const dy = (e.clientY - ly) * 0.005

      // Yaw: 월드 Y축 기준 좌우 회전
      meshRef.current.rotateOnWorldAxis(
        new THREE.Vector3(0, 1, 0),
        dx
      )

      // Pitch: 카메라의 오른쪽 축 기준 상하 회전
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      const right = new THREE.Vector3()
        .crossVectors(camera.up, forward)
        .normalize()
      meshRef.current.rotateOnWorldAxis(
        right,
        dy
      )

      lastPos.current = [e.clientX, e.clientY]
    }

    gl.domElement.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      gl.domElement.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [enableInteraction, gl.domElement, camera])

  // 텍스처 로드 (모든 시즌 동일 경로)
  const texturePath = '/textures/constellation_figures_64k_2 1.png'
  const tex = useMemo(
    () =>
      activeSeason
        ? new THREE.TextureLoader().load(texturePath)
        : null,
    [activeSeason]
  )
  if (!tex) return null

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial
        map={tex}
        color={new THREE.Color(0.9, 0.9, 1).multiplyScalar(0.3)}
        side={THREE.BackSide}
        transparent
        opacity={0}
      />
    </mesh>
  )
}
