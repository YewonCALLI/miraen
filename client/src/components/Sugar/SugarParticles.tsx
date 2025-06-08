import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GRAVITY = -2.0 // -1.2에서 -2.0으로 증가
const WATER_LEVEL = 0.8

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  age: number
  delay: number
  state: 'waiting' | 'falling' | 'sinking' | 'removed'
  opacity: number
  scale: number
  initialPos: THREE.Vector3
  radialDir?: THREE.Vector3
}

interface SugarParticlesProps {
  startPosition?: [number, number, number]
  shouldDrop?: boolean
  sugarAmount?: number
  onAllDissolved?: () => void
  beakerId?: string
}

export function SugarParticles({
  startPosition = [0, 2, 0],
  shouldDrop = false,
  sugarAmount = 1.0,
  onAllDissolved,
  beakerId = 'default',
}: SugarParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  // 각 인스턴스마다 완전히 독립적인 ID와 데이터 생성
  const instanceData = useMemo(() => {
    const instanceId = `${beakerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const dummy = new THREE.Object3D()
    const numParticles = Math.floor(300 * sugarAmount)
    const timeOffset = Math.random() * 1000

    console.log(`SugarParticles 인스턴스 생성: ${instanceId}, 파티클 수: ${numParticles}`)

    return {
      instanceId,
      dummy,
      numParticles,
      timeOffset,
    }
  }, [beakerId, sugarAmount]) // sugarAmount가 변경될 때도 새로 생성

  // 각 인스턴스별 독립적인 상태
  const particles = useRef<Particle[]>([])
  const remaining = useRef(0)
  const active = useRef(false)
  const hasCalledCallback = useRef(false)
  const lastShouldDrop = useRef(false)

  console.log(`${instanceData.instanceId}: shouldDrop=${shouldDrop}, active=${active.current}`)

  // 파티클 초기화 함수
  const initializeParticles = useCallback(() => {
    console.log(`${instanceData.instanceId}: 파티클 초기화`)

    const arr: Particle[] = []
    for (let i = 0; i < instanceData.numParticles; i++) {
      const base = new THREE.Vector3(
        startPosition[0] + (Math.random() - 0.5) * 0.2,
        startPosition[1],
        startPosition[2] + (Math.random() - 0.5) * 0.2,
      )
      arr.push({
        initialPos: base.clone(),
        pos: base.clone(),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, Math.random() * 0.4 + 0.1, (Math.random() - 0.5) * 0.05),
        age: 0,
        delay: Math.random() * 0.4, // 0.8에서 0.4로 감소
        state: 'waiting',
        opacity: 1,
        scale: 0.5 + Math.random() * 0.4,
      })
    }

    particles.current = arr
    remaining.current = instanceData.numParticles
    active.current = false
    hasCalledCallback.current = false
    lastShouldDrop.current = false
  }, [instanceData.instanceId, instanceData.numParticles, startPosition])

  // 컴포넌트 마운트 시 파티클 초기화
  useEffect(() => {
    initializeParticles()
  }, [initializeParticles])

  // shouldDrop 상태 변경 처리 - 더 엄격한 제어
  useEffect(() => {
    const currentShouldDrop = shouldDrop
    const prevShouldDrop = lastShouldDrop.current

    console.log(`${instanceData.instanceId}: shouldDrop 변경 ${prevShouldDrop} -> ${currentShouldDrop}`)

    if (currentShouldDrop && !prevShouldDrop && !active.current) {
      // 실험 시작
      console.log(`${instanceData.instanceId}: 실험 시작`)
      active.current = true
      remaining.current = instanceData.numParticles
      hasCalledCallback.current = false

      // 모든 파티클 리셋하고 애니메이션 시작
      particles.current.forEach((p, index) => {
        p.pos.copy(p.initialPos)
        p.vel.set((Math.random() - 0.5) * 0.05, Math.random() * 0.4 + 0.1, (Math.random() - 0.5) * 0.05)
        p.age = 0
        p.delay = Math.random() * 0.4 // 0.8에서 0.4로 감소
        p.state = 'falling'
        p.radialDir = undefined
        p.opacity = 1
        p.scale = 0.5 + Math.random() * 0.4
      })
    } else if (!currentShouldDrop && prevShouldDrop && active.current) {
      // 실험 중지 - 초기 위치로 되돌림
      console.log(`${instanceData.instanceId}: 실험 중지`)
      active.current = false
      hasCalledCallback.current = false

      // 모든 파티클을 초기 위치에 표시
      particles.current.forEach((p) => {
        p.state = 'waiting'
        p.pos.copy(p.initialPos)
        p.opacity = 1
        p.scale = 0.5 + Math.random() * 0.4
        p.age = 0
      })
    }

    lastShouldDrop.current = currentShouldDrop
  }, [shouldDrop, instanceData.instanceId, instanceData.numParticles])

  // 용해 완료 콜백 - 중복 호출 방지와 정확한 인스턴스 확인
  const handleDissolved = useCallback(() => {
    if (hasCalledCallback.current || !active.current) {
      console.log(`${instanceData.instanceId}: 중복 콜백 또는 비활성 상태에서 호출 - 무시`)
      return
    }

    console.log(`${instanceData.instanceId}: 용해 완료 콜백 호출`)
    hasCalledCallback.current = true

    // 약간의 지연을 두고 콜백 호출 - 설탕이 완전히 사라진 후
    setTimeout(() => {
      if (onAllDissolved) {
        onAllDissolved()
      }
    }, 200) // 50ms에서 200ms로 증가
  }, [instanceData.instanceId, onAllDissolved])

  // 애니메이션 루프
  useFrame((state, delta) => {
    if (!meshRef.current) return

    const localTime = state.clock.elapsedTime + instanceData.timeOffset

    // 초기 상태 (실험 시작 전): 모든 파티클을 초기 위치에 표시
    if (!active.current) {
      particles.current.forEach((p, i) => {
        if (p.state === 'waiting') {
          instanceData.dummy.position.copy(p.initialPos)
          instanceData.dummy.scale.set(p.scale, p.scale, p.scale)
        } else {
          // removed 상태의 파티클은 숨김
          instanceData.dummy.position.set(0, -100, 0)
          instanceData.dummy.scale.set(0, 0, 0)
        }
        instanceData.dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
      return
    }

    // 애니메이션 실행 중
    let remainingCount = 0

    particles.current.forEach((p, i) => {
      if (p.state === 'removed') {
        instanceData.dummy.position.set(0, -100, 0)
        instanceData.dummy.scale.set(0, 0, 0)
        instanceData.dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
        return
      }

      if (p.state !== 'removed') {
        remainingCount++
      }

      p.age += delta

      // falling 단계
      if (p.state === 'falling') {
        if (p.age < p.delay) {
          // 대기 중
          instanceData.dummy.position.copy(p.initialPos)
          instanceData.dummy.scale.set(p.scale, p.scale, p.scale)
          instanceData.dummy.updateMatrix()
          meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
          return
        }

        // 낙하
        p.vel.y += GRAVITY * delta
        p.vel.multiplyScalar(0.98)
        p.pos.addScaledVector(p.vel, delta)

        // 물에 닿으면 sinking으로 전환
        if (p.pos.y <= WATER_LEVEL) {
          p.pos.y = WATER_LEVEL
          p.state = 'sinking'
          p.age = 0

          // 방사형 방향 설정
          const center = new THREE.Vector3(startPosition[0], WATER_LEVEL, startPosition[2])
          const dir = p.pos.clone().sub(center)
          dir.y = 0
          p.radialDir =
            dir.length() > 0.01
              ? dir.normalize()
              : new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()
        }
      }

      // sinking 단계
      if (p.state === 'sinking') {
        // 용해 - 아래로 내려가는 속도는 유지
        const dissolveSpeed = 0.08 * (1 + sugarAmount * 0.1)
        p.pos.y -= dissolveSpeed * delta

        // 방사형 확산 - 더 점진적으로 조정
        const radialSpeed = 0.06 * (1 - p.opacity) // 0.15에서 0.06으로 감소
        if (p.radialDir) {
          p.pos.x += p.radialDir.x * radialSpeed * delta
          p.pos.z += p.radialDir.z * radialSpeed * delta
        }

        // 브라운 운동 - 더 자연스럽게 조정
        const diffBase = 0.003 // 0.008에서 0.003으로 감소
        const diffusion = diffBase + (1 - p.opacity) * 0.01 // 0.025에서 0.01로 감소
        const seedX = i * 0.1 + instanceData.timeOffset
        const seedZ = i * 0.15 + instanceData.timeOffset
        p.pos.x += Math.sin(localTime * 10 + seedX) * diffusion * delta
        p.pos.z += Math.cos(localTime * 8 + seedZ) * diffusion * delta

        // 투명도와 크기 감소 - 물속에서 더 깊이 내려갈 수 있도록 매우 천천히
        const fadeSpeed = 0.3 * (1 / sugarAmount) // 0.8에서 0.3으로 대폭 감소
        p.opacity = Math.max(0, p.opacity - fadeSpeed * delta)
        p.scale = Math.max(0, p.scale - 0.15 * delta) // 0.4에서 0.15로 대폭 감소

        // 완전 용해 확인
        if (p.opacity <= 0 || p.scale <= 0) {
          p.state = 'removed'
          remainingCount--

          instanceData.dummy.position.set(0, -100, 0)
          instanceData.dummy.scale.set(0, 0, 0)
          instanceData.dummy.updateMatrix()
          meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
          return
        }
      }

      // waiting 상태 (초기 대기)
      if (p.state === 'waiting') {
        instanceData.dummy.position.copy(p.initialPos)
        instanceData.dummy.scale.set(p.scale, p.scale, p.scale)
        instanceData.dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
        return
      }

      // 일반 렌더링 (falling, sinking 중)
      instanceData.dummy.position.copy(p.pos)
      instanceData.dummy.scale.set(p.scale, p.scale, p.scale)
      instanceData.dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, instanceData.dummy.matrix)
    })

    // 모든 파티클이 용해되었는지 확인
    if (remainingCount === 0 && active.current && !hasCalledCallback.current) {
      console.log(`${instanceData.instanceId}: 모든 파티클 용해됨, 콜백 호출`)
      handleDissolved()
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, instanceData.numParticles]}
      frustumCulled={false}
      key={instanceData.instanceId} // 완전한 독립성 보장
      name={`sugar-particles-${instanceData.instanceId}`} // 디버깅용 고유 이름
    >
      <sphereGeometry args={[0.005, 6, 6]} />
      <meshStandardMaterial transparent opacity={1} color='white' depthWrite={false} />
    </instancedMesh>
  )
}
