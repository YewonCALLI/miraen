// pages/index.tsx or App.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Sky } from '@react-three/drei'
import Model from '../components/6-1-2/Model'
import Scene from '@/components/canvas/Scene'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'

// 카메라 컨트롤 컴포넌트
function CameraController({ 
  targetName, 
  isFollowing, 
  sceneRef 
}: { 
  targetName: string | null
  isFollowing: boolean
  sceneRef: React.RefObject<THREE.Group>
}) {
  const { camera } = useThree()
  const orbitControlsRef = useRef<any>()

  // 특정 이름의 오브젝트를 찾는 함수
  const findTargetByName = (targetName: string) => {
    if (!sceneRef.current) return null
    
    let targetObject: THREE.Object3D | null = null
    
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === targetName) {
        targetObject = child
      }
    })
    
    if (!targetObject) {
      console.log(`Object with name "${targetName}" not found`)
      // 사용 가능한 객체들을 다시 보여줌
      const allObjects: string[] = []
      sceneRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name) {
          allObjects.push(child.name)
        }
      })
      console.log('Available object names:', allObjects.slice(0, 20)) // 처음 20개만 표시
    }
    
    return targetObject
  }

  useFrame(() => {
    if (isFollowing && targetName && sceneRef.current) {
      const targetObject = findTargetByName(targetName)
      
      if (targetObject) {
        // 타겟 오브젝트의 위치 가져오기
        const targetPosition = new THREE.Vector3()
        targetObject.getWorldPosition(targetPosition)
        
        // 교통수단별로 다른 카메라 오프셋 적용
        let offset = new THREE.Vector3(0, 2, 5) // 기본 오프셋
        
        switch(targetName) {
          case 'body': // 말
            offset = new THREE.Vector3(2, 3, 0)
            break
          case 'Mesh123': // 자동차
            offset = new THREE.Vector3(-3, 2, 4)
            break
          case 'baseMesh1': // 사람
            offset = new THREE.Vector3(-1, 1, 2)
            break
          case 'Wheel_A': // 자전거
            offset = new THREE.Vector3(-2, 1.5, 3)
            break
          case 'bridge': // 기차
            offset = new THREE.Vector3(-5, 3, 6)
            break
        }
        
        const cameraPosition = targetPosition.clone().add(offset)
        
        // 카메라 위치 부드럽게 이동
        camera.position.lerp(cameraPosition, 0.08)
        
        // 카메라가 타겟을 바라보도록 설정
        camera.lookAt(targetPosition)
        
        // OrbitControls 타겟도 업데이트
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.lerp(targetPosition, 0.08)
        }
      }
    }
  })

  return (
    <OrbitControls 
      ref={orbitControlsRef}
      enabled={!isFollowing} // 따라가기 모드일 때는 수동 조작 비활성화
    />
  )
}

export default function Home() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [currentView, setCurrentView] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const sceneRef = useRef<THREE.Group>(null)

  const handleStartAnimation = () => {
    setIsAnimationPlaying(true)
  }

  const handleViewChange = (targetName: string) => {
    setCurrentView(targetName)
    setIsFollowing(true)
  }

  const handleResetView = () => {
    setIsFollowing(false)
    setCurrentView(null)
  }

  const viewButtons = [
    { name: '달리는 말 시점', targetName: 'body' }, // 말의 몸체
    { name: '자동차 시점', targetName: 'Mesh123' }, // 자동차 메인 메쉬
    { name: '달리는 사람 시점', targetName: 'baseMesh1' }, // 사람 베이스 메쉬
    { name: '자전거 시점', targetName: 'Wheel_A' }, // 자전거 바퀴
    { name: '기차 시점', targetName: 'bridge' }, // 기차 브릿지/본체
  ]

  return (
    <div className="w-screen h-screen bg-white relative">
      {/* 컨트롤 패널 */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={handleStartAnimation}
          disabled={isAnimationPlaying}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAnimationPlaying
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isAnimationPlaying ? '애니메이션 재생 중' : '시작하기'}
        </button>
        
        {isAnimationPlaying && (
          <div className="space-y-1">
            {viewButtons.map((button, idx) => (
              <button
                key={idx}
                onClick={() => handleViewChange(button.targetName)}
                className={`block w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === button.targetName
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {button.name}
              </button>
            ))}
            
            <button
              onClick={handleResetView}
              className="block w-full px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition-all"
            >
              자유 시점
            </button>
          </div>
        )}
      </div>

      <Scene 
        camera={{ position: [0, 1, 3], fov: 50 }}
        shadows="soft"
      >
        <ambientLight intensity={0.2} />
        
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />

        <group ref={sceneRef}>
          <Model 
            scale={1} 
            position={[0, 0, 0]} 
            animationSpeed={isAnimationPlaying ? 0.1 : 0}
            castShadow={true}
            receiveShadow={true}
          />
          
          <Model 
            scale={0.8} 
            position={[2, 0, 1]} 
            animationSpeed={isAnimationPlaying ? 0.05 : 0}
            castShadow={true}
            receiveShadow={true}
          />
        </group>
        
        <CameraController 
          targetName={currentView}
          isFollowing={isFollowing}
          sceneRef={sceneRef}
        />
        
        <Sky
          distance={450000}
          sunPosition={[-10, 0.9, -10]}
          inclination={0.49}
          azimuth={0.25}
          rayleigh={1.2}
          turbidity={1}
          mieCoefficient={0.008}
          mieDirectionalG={0.85}
        />
        <Environment preset={'apartment'} />
      </Scene>
    </div>
  )
}
