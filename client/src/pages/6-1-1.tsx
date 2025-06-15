// pages/index.tsx or App.tsx
import { Canvas } from '@react-three/fiber'
import { Billboard, Html, OrbitControls, Text } from '@react-three/drei'
import { Model } from '../components/6-1-1/Model'
import { SpeechBubble } from '../components/6-1-1/SpeechBubble'
import Scene from '@/components/canvas/Scene'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function Home() {
  const controlsRef = useRef<any>()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // 초기 카메라 설정 저장
  const initialCamera = {
    position: [-10, 5, 0] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
  }

  const moveToTarget = (targetPosition: [number, number, number], cameraPosition: [number, number, number]) => {
    if (controlsRef.current && !isAnimating) {
      setIsAnimating(true)
      setIsZoomed(true) // 말풍선 클릭 시 줌 상태로 변경

      const startTarget = controlsRef.current.target.clone()
      const startPosition = controlsRef.current.object.position.clone()

      const endTarget = new THREE.Vector3(...targetPosition)
      const endPosition = new THREE.Vector3(...cameraPosition)

      let progress = 0
      const duration = 1000 // 1초 애니메이션
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)

        // easeInOutQuad 이징 함수
        const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        // 타겟 보간
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)

        // 카메라 위치 보간
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)

        controlsRef.current.update()

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      animate()
    }
  }

  const resetCamera = () => {
    moveToTarget(initialCamera.target, initialCamera.position)
    setIsZoomed(false) // 초기 위치로 돌아갈 때 줌 상태 해제
  }

  return (
    <div className='w-screen h-screen bg-white flex flex-col'>
      {/* 말풍선을 클릭했을 때만 돌아가기 버튼 표시 */}
      {isZoomed && (
        <div className='absolute top-4 left-4 z-10'>
          <button
            onClick={resetCamera}
            disabled={isAnimating}
            className='bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-lg transition-colors'>
            🏠 돌아가기
          </button>
        </div>
      )}

      <Scene camera={{ position: initialCamera.position, fov: 50 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Model scale={1} position={[0, 0, 0]} />

        <SpeechBubble
          position={[-1.8, 1, -1.2]}
          pointColor='#2985ee'
          html='<mark>유리 세정제</mark>로 얼룩 제거하기'
          onBubbleClick={() => moveToTarget([-1.8, 1, -1.2], [-1, 2, 1])}
        />

        <SpeechBubble
          position={[4.3, 1, 0.8]}
          pointColor='#25e5c2'
          html='<mark>변기용 세제</mark>로 변기 청소하기'
          onBubbleClick={() => moveToTarget([4.3, 1, 0.8], [2, 2, 3])}
        />

        <SpeechBubble
          position={[4.3, 0.45, 1.8]}
          pointColor='#129d3a'
          html='<mark>표백제</mark>로 욕실 청소하기'
          bubbleOffset={[0.0, 0.4, 0.2]}
          onBubbleClick={() => moveToTarget([4.3, 0.45, 1.8], [1, 1.5, 2.5])}
        />

        <SpeechBubble
          position={[-2.7, 1, 3.1]}
          pointColor='#ff6b6b'
          html='<mark>식초</mark>로 생선 비린내 제거하기'
          bubbleOffset={[0.4, 0.6, -0.2]}
          onBubbleClick={() => moveToTarget([-2.7, 1, 3.1], [-1, 3, -0.5])} // 반대쪽에서 보기
        />

        <OrbitControls ref={controlsRef} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 6} />
      </Scene>
    </div>
  )
}
