// Experiment.tsx

import { useEffect, useRef, useState } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CandleLight from './CandleLight'
import Flame from './Flame'

interface ExperimentProps {
  setUiText: (text: string) => void
}

export default function Experiment({ setUiText }: ExperimentProps) {
  const { scene } = useGLTF('/models/Candle/Candle_experiment.gltf')
  const { camera, gl } = useThree()

  // 각 비커의 하한선 조정 (원래 위치 기준으로 적절히 설정)
  const LEFT_BEAKER_MIN_Y = 1.22   // 왼쪽 비커 하한선
  const RIGHT_BEAKER_MIN_Y = 1.16   // 오른쪽 비커 하한선

  // 오브젝트 참조들
  const leftBeakerRef = useRef<THREE.Object3D>(null)   // children[0] (원래 [1])
  const rightBeakerRef = useRef<THREE.Object3D>(null)  // children[1] (원래 [2])
  const rightCandleRef = useRef<THREE.Object3D>(null)  // children[2] (원래 [3])
  const leftCandleRef = useRef<THREE.Object3D>(null)   // children[3] (원래 [4])
  const leftRingRef = useRef<THREE.Object3D>(null)     // children[4] (원래 [5])
  const rightRingRef = useRef<THREE.Object3D>(null)    // children[5] (원래 [6])
  const oxygenPart1Ref = useRef<THREE.Object3D>(null)  // children[6] (원래 [7])
  const oxygenPart2Ref = useRef<THREE.Object3D>(null)  // children[7] (원래 [8])
  const oxygenGroupRef = useRef<THREE.Group>(null)  

  // 드래그 상태
  const dragging = useRef<'leftBeaker' | 'rightBeaker' | 'oxygen' | null>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const initialPos = useRef({ x: 0, y: 0 })

  // 원래 상대 위치 저장용
  const leftRingOriginalY = useRef(0)
  const rightRingOriginalY = useRef(0)
  
  // 각 비커의 원래 위치 저장용
  const leftBeakerOriginalY = useRef(0)
  const rightBeakerOriginalY = useRef(0)

  // 실험 단계 상태
  const [step, setStep] = useState(1)
  const [leftBeakerY, setLeftBeakerY] = useState(0)
  const [rightBeakerY, setRightBeakerY] = useState(0)
  const [oxygenX, setOxygenX] = useState(2)
  const [showFlame, setShowFlame] = useState(false)
  const [leftFlameOpacity, setLeftFlameOpacity] = useState(1)

  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useEffect(() => {
    console.log('Scene children before removal:', scene.children.length)
    
    // 0번 제거
    scene.remove(scene.children[0])
    
    console.log('Scene children after removal:', scene.children.length)

    // 오브젝트 연결 (이제 인덱스가 하나씩 앞당겨짐)
    leftBeakerRef.current = scene.children[0]   // 원래 [1]
    rightBeakerRef.current = scene.children[1]  // 원래 [2]
    rightCandleRef.current = scene.children[2]  // 원래 [3]
    leftCandleRef.current = scene.children[3]   // 원래 [4]
    rightRingRef.current = scene.children[4]  
    leftRingRef.current = scene.children[5]     
    oxygenPart1Ref.current = scene.children[6]  // 원래 [7] - 산소공급기 파트1
    oxygenPart2Ref.current = scene.children[7]  // 원래 [8] - 산소공급기 파트2

    // 산소공급기 그룹 생성
    const oxygenGroup = new THREE.Group()
    if (oxygenPart1Ref.current && oxygenPart2Ref.current) {
      // 원래 부모에서 제거
      scene.remove(oxygenPart1Ref.current)
      scene.remove(oxygenPart2Ref.current)
      
      // 그룹에 추가
      oxygenGroup.add(oxygenPart1Ref.current)
      oxygenGroup.add(oxygenPart2Ref.current)
      
      // 씬에 그룹 추가
      scene.add(oxygenGroup)
      oxygenGroupRef.current = oxygenGroup
    }

    console.log('leftBeaker:', leftBeakerRef.current)
    console.log('rightBeaker:', rightBeakerRef.current)
    console.log('leftCandle:', leftCandleRef.current)
    console.log('rightCandle:', rightCandleRef.current)
    console.log('leftRing:', leftRingRef.current)
    console.log('rightRing:', rightRingRef.current)
    console.log('oxygenGroup:', oxygenGroupRef.current)

    scene.position.set(0, -5, 0)

    // 원래 위치 저장 및 상대 위치 계산
    if (leftBeakerRef.current) {
      const originalY = leftBeakerRef.current.position.y
      leftBeakerOriginalY.current = originalY
      setLeftBeakerY(originalY)
      console.log('Left beaker original Y:', originalY)
    }
    if (rightBeakerRef.current) {
      const originalY = rightBeakerRef.current.position.y
      rightBeakerOriginalY.current = originalY
      setRightBeakerY(originalY)
      console.log('Right beaker original Y:', originalY)
      console.log('Left vs Right original Y:', leftBeakerOriginalY.current, 'vs', rightBeakerOriginalY.current)
    }
    if (oxygenGroupRef.current) {
      console.log('Oxygen group original X:', oxygenGroupRef.current.position.x)
      oxygenGroupRef.current.position.x = 0.3
      setOxygenX(2)
    }
    
    // 링들의 원래 상대 위치 저장 (비커와의 차이값)
    if (leftRingRef.current && leftBeakerRef.current) {
      const relativeY = leftRingRef.current.position.y - leftBeakerRef.current.position.y
      leftRingOriginalY.current = relativeY
      console.log('Left ring original relative Y:', relativeY)
    }
    if (rightRingRef.current && rightBeakerRef.current) {
      const relativeY = rightRingRef.current.position.y - rightBeakerRef.current.position.y
      rightRingOriginalY.current = relativeY
      console.log('Right ring original relative Y:', relativeY)
    }

    // 첫 번째 단계 시작
    setUiText('왼쪽 비커를 드래그해서 위로 올려보세요!')

    const handleDown = (e: PointerEvent) => {
      const bounds = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1
      const y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1
      const pointer = new THREE.Vector2(x, y)

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(pointer, camera)

      // 현재 step 값을 직접 참조하지 않고 state 사용
      setStep(currentStep => {
        console.log('Current step in handleDown:', currentStep)
        
        if (currentStep === 1) {
          // 1단계: 왼쪽 비커만
          const meshL = leftBeakerRef.current?.children.find((c: any) => c.isMesh) || leftBeakerRef.current
          const hitL = meshL && raycaster.intersectObject(meshL, true).length > 0

          if (hitL) {
            dragging.current = 'leftBeaker'
            startPos.current = { x: e.clientX, y: e.clientY }
            initialPos.current = { x: 0, y: leftBeakerRef.current!.position.y }
            setHovered(true)
            console.log('Started dragging left beaker')
          }
        } else if (currentStep === 2) {
          // 2단계: 오른쪽 비커만
          const meshR = rightBeakerRef.current?.children.find((c: any) => c.isMesh) || rightBeakerRef.current
          const hitR = meshR && raycaster.intersectObject(meshR, true).length > 0

          if (hitR) {
            dragging.current = 'rightBeaker'
            startPos.current = { x: e.clientX, y: e.clientY }
            initialPos.current = { x: 0, y: rightBeakerRef.current!.position.y }
            setHovered(true)
            console.log('Started dragging right beaker')
          }
        } else if (currentStep === 3) {
          // 3단계: 산소공급기
          const hitO = oxygenGroupRef.current && raycaster.intersectObject(oxygenGroupRef.current, true).length > 0

          if (hitO) {
            dragging.current = 'oxygen'
            startPos.current = { x: e.clientX, y: e.clientY }
            initialPos.current = { x: oxygenGroupRef.current!.position.x, y: 0 }
            setHovered(true)
            console.log('Started dragging oxygen')
          }
        } else if (currentStep === 4) {
          // 4단계: 촛불 클릭
          const hitLC = leftCandleRef.current && raycaster.intersectObject(leftCandleRef.current, true).length > 0
          const hitRC = rightCandleRef.current && raycaster.intersectObject(rightCandleRef.current, true).length > 0

          if (hitLC || hitRC) {
            setShowFlame(true)
            setUiText('불이 켜졌습니다! 이제 왼쪽 비커를 다시 내려보세요.')
            console.log('Candle clicked, moving to step 5')
            return 5
          }
        } else if (currentStep === 5) {
          // 5단계: 왼쪽 비커 내리기
          const meshL = leftBeakerRef.current?.children.find((c: any) => c.isMesh) || leftBeakerRef.current
          const hitL = meshL && raycaster.intersectObject(meshL, true).length > 0

          if (hitL) {
            dragging.current = 'leftBeaker'
            startPos.current = { x: e.clientX, y: e.clientY }
            initialPos.current = { x: 0, y: leftBeakerRef.current!.position.y }
            setHovered(true)
            console.log('Started dragging left beaker down')
          }
        } else if (currentStep === 6) {
          // 6단계: 오른쪽 비커 내리기 (7단계 이후에는 드래그 불가)
          const meshR = rightBeakerRef.current?.children.find((c: any) => c.isMesh) || rightBeakerRef.current
          const hitR = meshR && raycaster.intersectObject(meshR, true).length > 0

          if (hitR) {
            dragging.current = 'rightBeaker'
            startPos.current = { x: e.clientX, y: e.clientY }
            initialPos.current = { x: 0, y: rightBeakerRef.current!.position.y }
            setHovered(true)
            console.log('Started dragging right beaker down')
          }
        } else if (currentStep >= 7) {
          // 7단계 이후에는 드래그 비활성화
          console.log('Experiment completed, dragging disabled')
        }
        
        return currentStep // step 값 유지
      })
    }

    const handleMove = (e: PointerEvent) => {
      if (!dragging.current) return

      setStep(currentStep => {
        // 7단계 이후에는 드래그 중단
        if (currentStep >= 7) {
          dragging.current = null
          setHovered(false)
          return currentStep
        }

        if (dragging.current === 'leftBeaker' || dragging.current === 'rightBeaker') {
          // 드래그 감도를 약간 줄여서 더 정밀한 제어
          const dy = (startPos.current.y - e.clientY) / 120  // 100에서 120으로 변경
          let clampedY = Math.max(-2, Math.min(1.5, initialPos.current.y + dy))

          // 5단계, 6단계에서는 아래로만 내릴 수 있도록 제한
          if (currentStep === 5 || currentStep === 6) {
            if (dragging.current === 'leftBeaker') {
              // 왼쪽 비커: 설정된 하한선 사용
              const minY = LEFT_BEAKER_MIN_Y
              const maxY = initialPos.current.y
              const newY = initialPos.current.y + dy
              clampedY = Math.max(minY, Math.min(maxY, newY))
            } else if (dragging.current === 'rightBeaker') {
              // 오른쪽 비커: 왼쪽 비커와 동일한 로직으로 설정된 하한선 사용
              const minY = RIGHT_BEAKER_MIN_Y
              const maxY = initialPos.current.y
              const newY = initialPos.current.y + dy
              clampedY = Math.max(minY, Math.min(maxY, newY))
            }
          }

          if (dragging.current === 'leftBeaker' && leftBeakerRef.current) {
            leftBeakerRef.current.position.y = clampedY
            setLeftBeakerY(clampedY)
            
            // 왼쪽 링도 원래 상대 위치를 유지하며 움직임
            if (leftRingRef.current) {
              leftRingRef.current.position.y = clampedY + leftRingOriginalY.current
            }
          } else if (dragging.current === 'rightBeaker' && rightBeakerRef.current) {
            rightBeakerRef.current.position.y = clampedY
            setRightBeakerY(clampedY)
            
            // 오른쪽 링도 원래 상대 위치를 유지하며 움직임
            if (rightRingRef.current) {
              rightRingRef.current.position.y = clampedY + rightRingOriginalY.current
            }
          }
        } else if (dragging.current === 'oxygen') {
          const dx = (e.clientX - startPos.current.x) / 100
          const clampedX = Math.max(0.0, Math.min(1.5, initialPos.current.x + dx))

          if (oxygenGroupRef.current) {
            oxygenGroupRef.current.position.x = clampedX
            setOxygenX(clampedX)
          }
        }
        
        return currentStep 
      })
    }

    const handleUp = () => {
      if (dragging.current) {
        console.log('Stopped dragging:', dragging.current)
      }
      dragging.current = null
      setHovered(false)
    }

    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)

    return () => {
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [camera, gl, scene, LEFT_BEAKER_MIN_Y, RIGHT_BEAKER_MIN_Y]) // step을 dependency에서 제거

  // 단계 진행 확인
  useEffect(() => {
    console.log(`Step ${step} - Left Y: ${leftBeakerY.toFixed(2)}, Right Y: ${rightBeakerY.toFixed(2)}`)
    
    // 원래 위치 기준으로 상대적인 변화량으로 판단
    if (step === 1 && leftBeakerY >= 1.3) {
      setStep(2)
      setUiText('좋습니다! 이제 오른쪽 비커를 드래그해서 위로 올려보세요.')
    } else if (step === 2 && rightBeakerY >= 1.3) {
      setStep(3)
      setUiText('훌륭합니다! 이제 산소공급기를 왼쪽으로 드래그해서 오른쪽 비커에 가져다 대세요.')
    } else if (step === 3 && oxygenX <= 0.1) {
      setStep(4)
      setUiText('산소 공급 완료! 이제 촛불을 클릭해서 켜보세요.')
    } else if (step === 5 && leftBeakerY <= LEFT_BEAKER_MIN_Y + 0.1) { 
      setStep(6)
      setUiText('이제 오른쪽 비커도 내려보세요.')
    } else if (step === 6 && rightBeakerY <= RIGHT_BEAKER_MIN_Y + 0.1) { // 오른쪽 비커가 하한선 근처까지 내려왔을 때
      console.log('Right beaker reached minimum position, moving to step 7')
      setStep(7)
      setUiText('실험 관찰 중... 왼쪽 비커의 불이 서서히 꺼집니다.')
      
      // 왼쪽 촛불 서서히 끄기
      setTimeout(() => {
        console.log('Starting flame fade effect')
        const fadeInterval = setInterval(() => {
          setLeftFlameOpacity(prev => {
            const newOpacity = prev - 0.02  // 조금 더 빠르게 페이드
            console.log('Flame opacity:', newOpacity)
            if (newOpacity <= 0) {
              clearInterval(fadeInterval)
              console.log('Flame fade completed')
              setUiText('실험 완료! 산소가 연소에 필요하다는 것을 확인했습니다.')
              return 0
            }
            return newOpacity
          })
        }, 100)  // 조금 더 빠른 인터벌
      }, 1000)
    }
  }, [step, leftBeakerY, rightBeakerY, oxygenX, LEFT_BEAKER_MIN_Y, RIGHT_BEAKER_MIN_Y])

  return (
    <group>
      <primitive object={scene} scale={5.0} position={[0, 0, 0]} />
      
      {/* 촛불과 조명 효과 */}
      {showFlame && (
        <>
          {/* 오른쪽 촛불 */}
          <Flame position={[0.41, 0.3, 0]} opacity={1} />
          <CandleLight position={[1.5, 1.5, 0]} opacity={1} />
          
          {/* 왼쪽 촛불 (서서히 사라짐) */}
          <Flame position={[-0.57, 0.3, 0]} opacity={leftFlameOpacity} />
          <CandleLight position={[-1.5, 1.5, 0]} opacity={leftFlameOpacity} />
        </>
      )}
    </group>
  )
}