// components/SpaceScene.tsx
import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, SpotLight } from '@react-three/drei'
import * as THREE from 'three'
import { Sun, Stars, EarthModel } from '@/components/SpaceObjects'
import { ConstellationLayer } from '@/components/ConstellationLayer'


interface SpaceSceneProps {
  onEarthClick: (pos: [number, number, number], season: string) => void
  cameraTarget: [number, number, number] | null
  activeSeason: string | null
  isLockedToSurface: boolean
  onReset: () => void
}

export default function SpaceScene({
  onEarthClick,
  cameraTarget,
  activeSeason,
  isLockedToSurface,
  onReset,
}: SpaceSceneProps) {
  const controlsRef = useRef<any>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  // 이전 카메라 상태 저장
  const prevCameraState = useRef<{
    position: THREE.Vector3
    target: THREE.Vector3
  } | null>(null)
  // reset 애니메이터용 상태
  const [resetState, setResetState] = useState<{
    fromPos: THREE.Vector3
    fromTarget: THREE.Vector3
    toPos: THREE.Vector3
    toTarget: THREE.Vector3
  } | null>(null)

  // 지구 클릭 직전에 카메라 상태 한 번만 저장
  const handleEarthClickLocal = (pos: [number, number, number], season: string) => {
    if (controlsRef.current && !prevCameraState.current) {
      const ctrl = controlsRef.current
      prevCameraState.current = {
        position: ctrl.object.position.clone(),
        target: ctrl.target.clone(),
      }
    }
    onEarthClick(pos, season)
  }

  // 돌아가기 버튼 클릭 → ResetAnimator 렌더 트리거
  const handleResetClick = () => {
    if (controlsRef.current && prevCameraState.current) {
      const ctrl = controlsRef.current
      const fromPos = ctrl.object.position.clone()
      const fromTarget = ctrl.target.clone()
      const { position: toPos, target: toTarget } = prevCameraState.current
      setResetState({ fromPos, fromTarget, toPos, toTarget })
    }
  }

  // cameraTarget이 null→값 으로 바뀔 때 OrbitControls.target 업데이트 & 상호작용 리셋
  useEffect(() => {
    if (cameraTarget && controlsRef.current) {
      controlsRef.current.target.set(...cameraTarget)
      controlsRef.current.update()
    }
    setIsInteracting(false)
  }, [cameraTarget])

  // ResetAnimator 완료 콜백
  const onResetFinished = () => {
    // 상태 클리어
    prevCameraState.current = null
    setResetState(null)
    onReset()
  }

  // 카메라 이동 완료 시
  const onMoveFinished = () => {
    setIsInteracting(true)
  }

  return (
    <div className="absolute inset-0">
      (
        <button
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-white text-white rounded"
          onClick={handleResetClick}
        >
          돌아가기
        </button>
      )
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
      <fog attach="fog" args={['#220044', 0, 450]} />        
      <ambientLight intensity={0.5} />
        <pointLight color='white' intensity={50} />
        <Suspense fallback={null}>
          <Sun />
          <Stars />
          {['spring', 'summer', 'fall', 'winter'].map((season, i) => {
            const ang = (i * Math.PI) / 2
            const pos: [number, number, number] = [
              Math.cos(ang) * 2,
              0,
              Math.sin(ang) * 2,
            ]
            if (isLockedToSurface && activeSeason !== season) return null
            return (
              <EarthModel
              key={season}
              position={pos}
              onClick={() => handleEarthClickLocal(pos, season)}
              fadeReady={isInteracting && isLockedToSurface && activeSeason === season}
              season = {season}
            />

            )
          })}
          {/* 계절 클릭→지구 궤도 이동 */}
          <CameraAnimator
            target={cameraTarget}
            angleOffset={Math.PI/15}
            onFinish={onMoveFinished}
          />
          {/* 돌아가기 클릭→이전 상태로 되돌리기 */}
          {resetState && (
            <ResetAnimator
              {...resetState}
              controlsRef={controlsRef}
              onFinish={onResetFinished}
            />
          )}
          <ConstellationLayer
            activeSeason={activeSeason}
            enableInteraction={isInteracting}
            fadeOut={!!resetState} 
          />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom
          enableRotate
        />
      </Canvas>
    </div>
  )
}

// 기존 CameraAnimator (지구 눌렀을 때)
function CameraAnimator({
  target,
  angleOffset = 0,
  onFinish,
}: {
  target: [number, number, number] | null
  angleOffset?: number
  onFinish?: () => void
}) {
  const { camera } = useThree()
  const startRef = useRef<THREE.Vector3 | null>(null)
  const endRef = useRef<THREE.Vector3 | null>(null)
  const progress = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    if (!target) return
    finished.current = false
    progress.current = 0
    const tgt = new THREE.Vector3(...target)
    startRef.current = camera.position.clone().sub(tgt)

    const toSun = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), tgt)
      .normalize()
    let nightDir = toSun.clone().negate()
    nightDir.y = Math.abs(nightDir.y) || 0.1
    const rotAxis = new THREE.Vector3()
      .crossVectors(nightDir, new THREE.Vector3(0, 1, 0))
      .normalize()
    nightDir.applyAxisAngle(rotAxis, angleOffset)

    const offset = nightDir.multiplyScalar(0.15)
    const endVec = tgt.clone().add(offset).setY(tgt.y + 0.38)
    endRef.current = endVec.sub(tgt)
  }, [target, angleOffset, camera])

  useFrame((_, delta) => {
    if (!startRef.current || !endRef.current || !target) return
    progress.current = Math.min(progress.current + delta * 0.5, 1)
    const t = progress.current
    const eased = t * t * (3 - 2 * t)
    const curVec = startRef.current.clone().lerp(endRef.current, eased)
    camera.position.copy(new THREE.Vector3(...target).add(curVec))

    if (t === 1 && !finished.current) {
      finished.current = true
      onFinish?.()
    }

    const toSun = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...target))
      .normalize()
    let nightDir = toSun.clone().negate()
    nightDir.y = Math.abs(nightDir.y) || 0.1
    const rotAxis = new THREE.Vector3()
      .crossVectors(nightDir, new THREE.Vector3(0, 1, 0))
      .normalize()
    nightDir.applyAxisAngle(rotAxis, angleOffset)
    camera.lookAt(new THREE.Vector3(...target).add(nightDir))
  })

  return null
}

function ResetAnimator({
  fromPos,
  fromTarget,
  toPos,
  toTarget,
  controlsRef,
  onFinish,
}: {
  fromPos: THREE.Vector3
  fromTarget: THREE.Vector3
  toPos: THREE.Vector3
  toTarget: THREE.Vector3
  controlsRef: React.RefObject<any>
  onFinish?: () => void
}) {
  const { camera } = useThree()
  const progress = useRef(0)

  useEffect(() => {
    progress.current = 0
  }, [])

  useFrame((_, delta) => {
    progress.current = Math.min(progress.current + delta * 0.25, 1)
    const t = progress.current
    const eased = t * t * (3 - 2 * t)

    camera.position.lerpVectors(fromPos, toPos, eased)
    controlsRef.current.target.lerpVectors(fromTarget, toTarget, eased)
    controlsRef.current.update()

    if (t === 1) {
      onFinish?.()
    }
  })

  return null
}

