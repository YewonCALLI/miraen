import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Model from '../components/Sugar/Model'
import { useState, useRef, useCallback } from 'react'
import Scene from '@/components/canvas/Scene'
import { BaseModel } from '@/components/Sugar/BaseModel'
import { Tomato } from '@/components/Sugar/Tomato'
import { DirectTomato } from '@/components/Sugar/DirectTomato'
import { Spoon } from '@/components/Sugar/Spoon'
import { SugarParticles } from '@/components/Sugar/SugarParticles'

function useSpoonBySpoonBeaker(beakerId: string, totalSpoons: number) {
  const [currentSpoon, setCurrentSpoon] = useState(0)
  const [totalDissolved, setTotalDissolved] = useState(0)
  const [isDropping, setIsDropping] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startExperiment = useCallback(() => {
    console.log(`${beakerId}: 실험 시작 - 총 ${totalSpoons}스푼`)
    setCurrentSpoon(1)
    setTotalDissolved(0)
    setIsCompleted(false)
    setIsDropping(true)
  }, [beakerId, totalSpoons])

  const handleSpoonDissolved = useCallback(() => {
    console.log(`${beakerId}: ${currentSpoon}번째 스푼 용해 완료`)
    setTotalDissolved((prev) => prev + 1)
    setIsDropping(false)

    if (currentSpoon < totalSpoons) {
      console.log(`${beakerId}: 다음 스푼 준비 중...`)
      timeoutRef.current = setTimeout(() => {
        setCurrentSpoon((prev) => prev + 1)
        setIsDropping(true)
        console.log(`${beakerId}: ${currentSpoon + 1}번째 스푼 투입`)
      }, 0)
    } else {
      console.log(`${beakerId}: 모든 스푼 완료!`)
      setIsCompleted(true)
    }
  }, [beakerId, currentSpoon, totalSpoons])

  const stopExperiment = useCallback(() => {
    console.log(`${beakerId}: 실험 중지`)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsDropping(false)
    setCurrentSpoon(0)
  }, [beakerId])

  const reset = useCallback(() => {
    console.log(`${beakerId}: 초기화`)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setCurrentSpoon(0)
    setTotalDissolved(0)
    setIsDropping(false)
    setIsCompleted(false)
  }, [beakerId])

  const isExperimentRunning = currentSpoon > 0 && !isCompleted

  return {
    currentSpoon,
    totalDissolved,
    isDropping,
    isCompleted,
    isExperimentRunning,
    startExperiment,
    stopExperiment,
    reset,
    handleSpoonDissolved,
    progress: `${currentSpoon}/${totalSpoons}`,
  }
}

function useTomatoDrop(beakerId: string) {
  const [isDropped, setIsDropped] = useState(false)
  const [isFloating, setIsFloating] = useState(false)

  const dropTomato = useCallback(() => {
    console.log(`${beakerId}: 토마토 드롭!`)
    setIsDropped(true)
    setIsFloating(false)
  }, [beakerId])

  const handleTomatoInWater = useCallback(() => {
    console.log(`${beakerId}: 토마토가 물에 들어감`)
    setIsFloating(true)
  }, [beakerId])

  const reset = useCallback(() => {
    console.log(`${beakerId}: 토마토 리셋`)
    setIsDropped(false)
    setIsFloating(false)
  }, [beakerId])

  return {
    isDropped,
    isFloating,
    dropTomato,
    handleTomatoInWater,
    reset,
  }
}

export default function Home() {
  const leftBeaker = useSpoonBySpoonBeaker('LEFT', 1)
  const leftTomato = useTomatoDrop('LEFT_TOMATO')
  const rightBeaker = useSpoonBySpoonBeaker('RIGHT', 5)
  const rightTomato = useTomatoDrop('RIGHT_TOMATO')

  const leftConcentration = leftBeaker.totalDissolved * 4.2
  const rightConcentration = rightBeaker.totalDissolved * 4.2

  const leftDensity = 1.0 + leftConcentration * 0.004
  const rightDensity = 1.0 + rightConcentration * 0.004

  const resetAll = useCallback(() => {
    leftBeaker.reset()
    rightBeaker.reset()
    leftTomato.reset()
    rightTomato.reset()
  }, [leftBeaker, rightBeaker, leftTomato, rightTomato])

  return (
    <div className='w-screen h-screen bg-gray flex flex-col'>

      {/* 왼쪽 비커 컨트롤 */}
      <div className='absolute top-20 left-4 z-10 bg-blue-50/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-200 w-72'>
        <h3 className='text-lg font-semibold text-blue-800 mb-3'>왼쪽 비커 (저농도)</h3>
        <div className='mb-3 p-3 bg-blue-100 rounded-lg'>
          <div className='text-sm text-blue-700'>
            <div>
              투입량: <span className='font-semibold'>1스푼</span>
            </div>
            <div>
              용해된 양: <span className='font-semibold'>{leftBeaker.totalDissolved}스푼</span>
            </div>
            <div>
              농도: <span className='font-semibold'>{leftConcentration.toFixed(1)}g/100ml</span>
            </div>
            <div>
              밀도: <span className='font-semibold'>{leftDensity.toFixed(3)}g/ml</span>
            </div>
          </div>
        </div>

        {leftBeaker.isExperimentRunning && (
          <div className='mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800'>
            {leftBeaker.isDropping ? `${leftBeaker.currentSpoon}번째 스푼 용해 중...` : '다음 스푼 준비 중...'}
          </div>
        )}

        {leftBeaker.isCompleted && !leftTomato.isDropped && (
          <div className='mb-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800'>
            ✅ 설탕 실험 완료! 이제 토마토를 떨어뜨려보세요
          </div>
        )}

        {leftTomato.isFloating && (
          <div className='mb-3 p-2 bg-purple-100 border border-purple-300 rounded text-sm text-purple-800'>
            🍅 토마토가 물에서 {leftConcentration > 0 ? '부력을 받고' : '가라앉고'} 있습니다
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <button
              onClick={leftBeaker.startExperiment}
              disabled={leftBeaker.isExperimentRunning || leftBeaker.isCompleted}
              className='px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              설탕 실험
            </button>
            <button
              onClick={leftBeaker.stopExperiment}
              disabled={!leftBeaker.isExperimentRunning}
              className='px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              중지
            </button>
          </div>

          {leftBeaker.isCompleted && (
            <button
              onClick={leftTomato.dropTomato}
              disabled={leftTomato.isDropped}
              className='px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              🍅 토마토 드롭
            </button>
          )}

          <button
            onClick={() => {
              leftBeaker.reset()
              leftTomato.reset()
            }}
            disabled={leftBeaker.isExperimentRunning}
            className='px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm'>
            초기화
          </button>
        </div>
      </div>

      {/* 오른쪽 비커 컨트롤 */}
      <div className='absolute top-20 right-4 z-10 bg-green-50/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-green-200 w-72'>
        <h3 className='text-lg font-semibold text-green-800 mb-3'>오른쪽 비커 (고농도)</h3>
        <div className='mb-3 p-3 bg-green-100 rounded-lg'>
          <div className='text-sm text-green-700'>
            <div>
              투입량: <span className='font-semibold'>5스푼</span>
            </div>
            <div>
              진행률: <span className='font-semibold'>{rightBeaker.progress}</span>
            </div>
            <div>
              용해된 양: <span className='font-semibold'>{rightBeaker.totalDissolved}스푼</span>
            </div>
            <div>
              농도: <span className='font-semibold'>{rightConcentration.toFixed(1)}g/100ml</span>
            </div>
            <div>
              밀도: <span className='font-semibold'>{rightDensity.toFixed(3)}g/ml</span>
            </div>
          </div>
        </div>

        {rightBeaker.isExperimentRunning && (
          <div className='mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800'>
            {rightBeaker.isDropping ? `${rightBeaker.currentSpoon}번째 스푼 용해 중...` : '다음 스푼 준비 중...'}
          </div>
        )}

        {rightBeaker.isCompleted && !rightTomato.isDropped && (
          <div className='mb-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800'>
            ✅ 설탕 실험 완료! 이제 토마토를 떨어뜨려보세요
          </div>
        )}

        {rightTomato.isFloating && (
          <div className='mb-3 p-2 bg-purple-100 border border-purple-300 rounded text-sm text-purple-800'>
            🍅 토마토가 물에서 {rightConcentration > 15 ? '더 강한 부력을 받고' : '부력을 받고'} 있습니다
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <button
              onClick={rightBeaker.startExperiment}
              disabled={rightBeaker.isExperimentRunning || rightBeaker.isCompleted}
              className='px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              설탕 실험
            </button>
            <button
              onClick={rightBeaker.stopExperiment}
              disabled={!rightBeaker.isExperimentRunning}
              className='px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              중지
            </button>
          </div>

          {rightBeaker.isCompleted && (
            <button
              onClick={rightTomato.dropTomato}
              disabled={rightTomato.isDropped}
              className='px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'>
              🍅 토마토 드롭
            </button>
          )}

          <button
            onClick={() => {
              rightBeaker.reset()
              rightTomato.reset()
            }}
            disabled={rightBeaker.isExperimentRunning}
            className='px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm'>
            초기화
          </button>
        </div>
      </div>


      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={2.5} position={[2, 4, 2]} castShadow />
        <Environment preset='warehouse' />

        {/* 왼쪽 비커 - 수정된 sugar props */}
        <Model
          key={`left-beaker-spoon-${leftBeaker.currentSpoon}`}
          scale={0.8}
          position={[-1.3, -0.6, 0]}
          shouldDropSugar={!leftBeaker.isCompleted && leftBeaker.isDropping}
          sugarAmount={leftBeaker.isCompleted ? 0 : 1}
          onAllDissolved={leftBeaker.handleSpoonDissolved}
          beakerId={`LEFT_SPOON_${leftBeaker.currentSpoon}`}
        />

        {leftBeaker.isCompleted && (
          <DirectTomato
            startPosition={[-1.45, 1.5, 0.2]}
            sugarConcentration={leftConcentration}
            beakerRadius={0.32}
            waterLevel={0.56}
            beakerPosition={[-1.3, -0.35, 0]}
            isDropped={leftTomato.isDropped}
            onDrop={leftTomato.handleTomatoInWater}
            bottomY={-0.5}  // 이 부분 추가
            waterSurfaceOffset={0.1}  // 이 부분 추가
          />
        )}
        <BaseModel scale={6} position={[-0.5, -0.6, 0]} />

        {!leftBeaker.isCompleted && (
          <Tomato scale={6} position={[-0.45, -0.7, 0.25]} rotation={[1.744, -0.13, -0.618]} />
        )}
        {!rightBeaker.isCompleted && <Tomato scale={6} position={[-0.7, -0.7, -0.01]} rotation={[1.744, 0.13, 0.8]} />}

        <Spoon scale={6} position={[0.5, -0.14, 0.08]} rotation={[Math.PI / 2, Math.PI / 4, Math.PI / 2]} />

        {/* 오른쪽 비커 - 수정된 sugar props */}
        <Model
          key={`right-beaker-spoon-${rightBeaker.currentSpoon}`}
          scale={0.8}
          position={[1.3, -0.6, 0]}
          shouldDropSugar={!rightBeaker.isCompleted && rightBeaker.isDropping}
          sugarAmount={rightBeaker.isCompleted ? 0 : 1}
          onAllDissolved={rightBeaker.handleSpoonDissolved}
          beakerId={`RIGHT_SPOON_${rightBeaker.currentSpoon}`}
        />

        {rightBeaker.isCompleted && (
          <DirectTomato
            startPosition={[1.1, 1.5, 0.2]}
            sugarConcentration={rightConcentration}
            beakerRadius={0.32}
            waterLevel={0.56}
            beakerPosition={[1.3, -0.35, 0]}
            isDropped={rightTomato.isDropped}
            onDrop={rightTomato.handleTomatoInWater}
            bottomY={-0.5}  // 이 부분 추가
            waterSurfaceOffset={0.1}  // 이 부분 추가
          />
        )}

        <OrbitControls />
      </Canvas>
    </div>
  )
}
