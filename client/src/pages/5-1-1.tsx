import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky, Environment } from '@react-three/drei'
import Model from '../components/Dinosaur/Model'
import LoadingScreen from '../components/Dinosaur/LoadingScreen'
import Ocean from '../components/Dinosaur/Ocean'
import { useEffect, useState, Suspense, useRef } from 'react'
import UnderwaterEnvironment from '@/components/Dinosaur/Underwater'
import * as THREE from 'three'
import CameraLogger from '@/components/CameraLogger'
import Scene from '@/components/canvas/Scene'

const modelPaths = [
  'models/Dinosaur/1/Dino.gltf',
  'models/Dinosaur/2/Dino.gltf',
  'models/Dinosaur/3/Dino.gltf',
  'models/Dinosaur/4/Dino.gltf',
]

const sceneDescriptions = [
  "죽은 생물의 몸체가 호수나 바다에 가라 앉습니다",
  "생물의 몸체 위로 퇴적물이 빠르게 쌓입니다", 
  "퇴적물이 계속 쌓여 지층이 만들어지고, 지층 속에 있던 생물의 몸체는 화석이 됩니다",
  "지층이 드러난 다음 지층이 깎여 화석이 보입니다"
]

const cameraPositions = [
  new THREE.Vector3(0, 20, 0),   // 씬 1
  new THREE.Vector3(0, 20, 3),   // 씬 2
  new THREE.Vector3(0, 16, 0),   // 씬 3
  new THREE.Vector3(0, 16, 0),   // 씬 4
]

function SceneCameraController({ sceneIndex }: { sceneIndex: number }) {
  const { camera } = useThree()

  useEffect(() => {
    const pos = cameraPositions[sceneIndex - 1]
    camera.position.copy(pos)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [sceneIndex, camera])

  return null
}

// 애니메이션 컨트롤러 컴포넌트
function AnimationController({ 
  sceneIndex, 
  modelLoaded, 
  onWaterLevelUpdate 
}: { 
  sceneIndex: number
  modelLoaded: boolean
  onWaterLevelUpdate: (level: number) => void 
}) {
  const animationStateRef = useRef({
    isAnimating: false,
    hasStarted: false,
    currentWaterLevel: -0.05, // 물이 아래에서 시작
    lastSceneIndex: -1,
    modelLoadTime: null as number | null
  })

  useEffect(() => {
    const state = animationStateRef.current
    
    // 씬이 실제로 변경된 경우에만 초기화
    if (state.lastSceneIndex !== sceneIndex) {
      console.log('씬 변경 감지:', sceneIndex)
      state.lastSceneIndex = sceneIndex
      state.isAnimating = false
      state.hasStarted = false
      state.modelLoadTime = null
      
      if (sceneIndex === 1) {
        state.currentWaterLevel = -0.05 // 물이 아래에서 시작
      } else {
        state.currentWaterLevel = 4 // 다른 씬에서는 물이 위에
      }
      
      onWaterLevelUpdate(state.currentWaterLevel)
    }
  }, [sceneIndex, onWaterLevelUpdate])

  // 모델 로드 시점 기록
  useEffect(() => {
    const state = animationStateRef.current
    if (modelLoaded && sceneIndex === 1 && !state.modelLoadTime) {
      state.modelLoadTime = Date.now()
      console.log('모델 로드 시점 기록')
    }
  }, [modelLoaded, sceneIndex])

  useFrame((_, delta) => {
    const state = animationStateRef.current
    
    // 씬 1에서만 애니메이션 실행
    if (sceneIndex !== 1 || !modelLoaded || !state.modelLoadTime) return
    
    // 애니메이션이 아직 시작되지 않았다면 2초 대기
    if (!state.hasStarted) {
      if (Date.now() - state.modelLoadTime > 1500) { // 모델 로드 후 2초 대기
        state.hasStarted = true
        state.isAnimating = true
        console.log('물이 올라오기 시작!')
      }
      return
    }
    
    // 물 올라오는 애니메이션 실행
    if (state.isAnimating) {
      const targetLevel = 4 // 물이 올라갈 최종 높이
      const speed = 1.0 // 애니메이션 속도
      
      state.currentWaterLevel += (targetLevel - state.currentWaterLevel) * speed * delta
      
      // 목표 위치에 거의 도달했으면 애니메이션 종료
      if (Math.abs(state.currentWaterLevel - targetLevel) < 0.1) {
        state.currentWaterLevel = targetLevel
        state.isAnimating = false
        console.log('물이 완전히 올라옴!')
      }
      
      onWaterLevelUpdate(state.currentWaterLevel)
    }
  })

  return null
}

export default function FossilViewer() {
  const [sceneIndex, setSceneIndex] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [waterLevel, setWaterLevel] = useState(-5) // 물의 높이 상태
  const [modelLoaded, setModelLoaded] = useState(false)

  const showWater = sceneIndex === 1 || sceneIndex === 2

  useEffect(() => {
    async function preloadAll() {
      try {
        await Promise.all(modelPaths.map((path) => useGLTF.preload(path)))
        setLoaded(true)
      } catch (err) {
        console.error('모델 로딩 실패:', err)
        setLoaded(true)
      }
    }
    preloadAll()
  }, [])

  // 씬이 변경될 때마다 상태 초기화
  useEffect(() => {
    console.log('씬 변경:', sceneIndex)
    // modelLoaded 상태는 여기서 초기화하지 않음
  }, [sceneIndex])

  const handleWaterLevelUpdate = (level: number) => {
    setWaterLevel(level)
  }

  const modelPosition: [number, number, number] = 
    sceneIndex === 2
      ? [-2.5, -6, -2]
      : [0, -8, 0] // 모델은 고정 위치에 유지

  const handleModelLoaded = () => {
    console.log('Model loaded for scene:', sceneIndex)
    // 중복 호출 방지
    if (!modelLoaded) {
      setModelLoaded(true)
    }
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="flex justify-center gap-2 p-4 bg-gray-900/90 text-white z-10">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setSceneIndex(num)}
            className={`px-4 py-2 rounded-lg transition-all ${
              sceneIndex === num 
                ? 'bg-blue-500 shadow-lg' 
                : 'bg-gray-700/80 hover:bg-gray-600'
            }`}
          >
           STEP {num}
          </button>
        ))}
      </div>

      <div className="text-center p-4 bg-black text-white">
        <p className="text-lg font-medium">
          {sceneDescriptions[sceneIndex - 1]}
        </p>
      </div>

      <div className="flex-1">
        <Scene
          shadows
          camera={{ position: [0, 0, 0], fov: 50 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          }}
        >
          <SceneCameraController sceneIndex={sceneIndex} />
          <AnimationController 
            sceneIndex={sceneIndex}
            modelLoaded={modelLoaded}
            onWaterLevelUpdate={handleWaterLevelUpdate}
          />
          <CameraLogger />

          {!showWater && (
            <>
              <ambientLight intensity={0.3} />
              <directionalLight 
                castShadow 
                position={[10, 20, 5]} 
                intensity={1.2}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-camera-near={0.1}
                shadow-camera-far={50}
                shadow-bias={-0.0001}
              />
              <pointLight 
                position={[-10, 10, -10]} 
                intensity={0.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
            </>
          )}

          <fogExp2 attach="fog" args={['#001122', 0.01]} />

          <Suspense fallback={null}>
            <Model
              key={sceneIndex}
              path={modelPaths[sceneIndex - 1]}
              scale={4}
              position={modelPosition}
              sceneIndex={sceneIndex}
              onLoaded={handleModelLoaded}
            />

            {showWater && (
              <>
                <Ocean 
                  textureUrl="/models/Dinosaur/ground.png"
                  normalMapUrl="/models/Dinosaur/1/Terrain_Terrain_Normal_OpenGL.png"
                  textureScale={10.0}
                  textureOpacity={0.83}
                  timeSpeed={0.9}
                  flowSpeed={0.9}
                  waterLevel={waterLevel}
                />
                <UnderwaterEnvironment sceneIndex={sceneIndex} />
              </>
            )}
          </Suspense>

          <Environment preset='sunset' />

          {!showWater && (
            <mesh 
              position={[0, -2, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              receiveShadow
            />
          )}

          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={100}
          />
        </Scene>
      </div>
    </div>
  )
}