import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface ModelProps {
  path: string
  scale?: number
  position?: [number, number, number]
  sceneIndex?: number
  onLoaded?: () => void
}

export default function Model({ path, scale = 4, position = [0, 0, 0], sceneIndex, onLoaded}: ModelProps) {
  const { scene: originalScene, animations } = useGLTF(path)
  const mixer = useRef<THREE.AnimationMixer | null>(null)
  const hasCalledOnLoaded = useRef(false)
  const sceneRef = useRef<number>(-1)
  const isLoadedRef = useRef(false)
  const actionsRef = useRef<THREE.AnimationAction[]>([])

  const clonedScene = useMemo(() => {
    console.log(`Creating cloned scene for scene ${sceneIndex} with path: ${path}`)
    console.log(`Available animations:`, animations?.map((anim, idx) => ({ index: idx, name: anim.name, duration: anim.duration })))
    
    // ⭐ clone 대신 originalScene을 직접 사용해보기
    const sceneToUse = sceneIndex === 0 ? originalScene : originalScene.clone(true)
    
    // 본(Bone) 구조 확인
    let boneCount = 0
    let skinnedMeshCount = 0
    
    sceneToUse.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        
        if (!isLoadedRef.current) {
          isLoadedRef.current = true
          console.log(`Mesh loaded for scene ${sceneIndex}`)
        }
      }
      
      if (child.type === 'Bone') {
        boneCount++
      }
    })
    
    console.log(`Scene analysis - Bones: ${boneCount}, SkinnedMeshes: ${skinnedMeshCount}`)

    return sceneToUse
  }, [originalScene, sceneIndex, path, animations])

  // 씬이 변경되었을 때 상태 리셋
  useEffect(() => {
    if (sceneRef.current !== sceneIndex) {
      console.log(`Scene changed from ${sceneRef.current} to ${sceneIndex}`)
      sceneRef.current = sceneIndex || -1
      hasCalledOnLoaded.current = false
      isLoadedRef.current = false
      
      // 이전 애니메이션 정리
      if (mixer.current) {
        actionsRef.current.forEach(action => action.stop())
        actionsRef.current = []
        mixer.current.stopAllAction()
        mixer.current = null
      }
    }
  }, [sceneIndex])

  // 애니메이션 설정을 위한 별도 useEffect
  useEffect(() => {
    if (!animations || animations.length === 0 || !clonedScene) {
      console.log('No animations or scene available')
      return
    }
    
    console.log(`Setting up animations for scene ${sceneIndex}`)
    console.log('Total animations available:', animations.length)
    
    // 기존 애니메이션 완전히 정리
    if (mixer.current) {
      mixer.current.stopAllAction()
      mixer.current.uncacheRoot(clonedScene)
      mixer.current = null
    }
    actionsRef.current = []
    
    // ⭐ 중요: originalScene으로 믹서를 생성하되, 애니메이션은 clonedScene에 적용
    mixer.current = new THREE.AnimationMixer(originalScene)
    
    // 0번 애니메이션 가져오기
    const targetClip = animations[0]
    console.log(`Forcing animation 0: ${targetClip.name}`)
    console.log(`Animation duration: ${targetClip.duration}s`)
    console.log(`Animation tracks: ${targetClip.tracks.length}`)
    
    // 애니메이션 트랙 상세 분석
    targetClip.tracks.forEach((track, index) => {
      if (index < 3) { // 처음 3개 트랙만 로그
        console.log(`Track ${index}: ${track.name} (${track.constructor.name})`)
      }
    })
    
    // ⭐ clonedScene을 타겟으로 하는 액션 생성
    const action = mixer.current.clipAction(targetClip, clonedScene)
    
    // 씬별 애니메이션 처리
    if (sceneIndex === 0) {
      // STEP 0: 살아있는 공룡 - 애니메이션 재생
      console.log(`🦕 Setting up LIVING dinosaur animation for scene ${sceneIndex}`)
      
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.clampWhenFinished = false
      action.enabled = true
      action.setEffectiveTimeScale(2.0) // 2배 빠르게 해서 변화를 더 쉽게 확인
      action.setEffectiveWeight(1.0)
      action.play()
      
      console.log(`✅ Animation STARTED for living dinosaur`)
      
      // 애니메이션이 올바른 오브젝트에 바인딩되었는지 확인
      const root = action.getRoot()
      console.log(`Animation root:`, root?.name, root?.type)
      console.log(`Target object:`, clonedScene.name, clonedScene.type)
      
    } else {
      // STEP 1-4: 죽은 공룡 - 정적 포즈
      console.log(`💀 Setting up DEAD dinosaur pose for scene ${sceneIndex}`)
      
      action.reset()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      action.enabled = true
      action.setEffectiveTimeScale(0) // 시간 정지
      action.setEffectiveWeight(1.0)
      action.time = 0 // 첫 번째 프레임
      action.paused = true
      action.play()
    }
    
    actionsRef.current = [action]
    

  }, [animations, clonedScene, sceneIndex, originalScene])

  // 모델 로드 완료 처리 (onLoaded 콜백만)
  useEffect(() => {
    // onLoaded 콜백 호출 (씬당 한 번만)
    if (onLoaded && !hasCalledOnLoaded.current && clonedScene) {
      hasCalledOnLoaded.current = true
      
      // 다음 프레임에 호출하여 렌더링이 완료된 후 실행되도록 함
      const timeoutId = setTimeout(() => {
        onLoaded()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [onLoaded, sceneIndex, clonedScene])

  useFrame((_, delta) => {
    if (mixer.current) {
      // STEP 0에서만 애니메이션 업데이트
      if (sceneIndex === 0) {
        mixer.current.update(delta*0.8)
        
        // 5초마다 애니메이션 상태 및 변환 매트릭스 출력
        if (Math.floor(mixer.current.time * 2) % 10 === 0 && actionsRef.current.length > 0) {
          const action = actionsRef.current[0]
          console.log(`🎬 Animation running - Time: ${action.time.toFixed(2)}s/${action.getClip().duration.toFixed(2)}s, Active: ${action.isRunning()}`)
          
          // 본 변환 확인 (첫 번째 본만)
          if (clonedScene) {
            clonedScene.traverse((child) => {
              if (child.type === 'Bone' && (child.name.includes('Spine') || child.name.includes('Hip') || child.name.includes('Root'))) {
                console.log(`Bone ${child.name} position:`, child.position.x.toFixed(3), child.position.y.toFixed(3), child.position.z.toFixed(3))
                return // 첫 번째만 출력
              }
            })
          }
        }
        
        // 애니메이션이 멈춘 경우 다시 시작
        if (actionsRef.current.length > 0) {
          const action = actionsRef.current[0]
          if (!action.isRunning() && !action.paused) {
            console.log('🔄 Animation stopped, restarting...')
            action.reset()
            action.play()
          }
        }
      }
      // 다른 씬에서는 믹서 업데이트 안 함 (정적 포즈 유지)
    }
  })

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (mixer.current) {
        actionsRef.current.forEach(action => action.stop())
        actionsRef.current = []
        mixer.current.stopAllAction()
        mixer.current = null
      }
    }
  }, [])

  if (!clonedScene) {
    return null
  }

  return <primitive object={clonedScene} scale={scale} position={position} />
}

// 프리로드 함수 export
export const preloadModel = (path: string) => {
  return useGLTF.preload(path)
}