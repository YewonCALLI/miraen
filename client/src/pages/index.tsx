import Scene from '@/components/canvas/Scene'
import { OrbitControls } from '@react-three/drei'
import { useRouter } from 'next/router'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'
import { useGLTF } from '@react-three/drei'
import {
  Stars,
  DashedSphere,
  Sun,
  Earth,
  HumanModel,
  LargeSphere,
  getHumanPositionOffset,
  useGLTFWithCache,
  useTexture,
} from '../components/components'
import { PageProps, EarthVisibilityState } from '../types/types'
import CameraController from '../components/cameraController'

// 텍스처 미리 캐싱
const textureLoader = new THREE.TextureLoader()
const textureCache: { [key: string]: THREE.Texture } = {}
// ... 생략된 import는 그대로 유지
export default function Page(props: PageProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [active, setActive] = useState(false)
  const [earthPosition, setEarthPosition] = useState<[number, number, number]>([5, 0, 0])
  const [isEarthOrbiting, setIsEarthOrbiting] = useState(true)
  const [shouldEarthRotate, setShouldEarthRotate] = useState(true)

  const [targetSpherePosition, setTargetSpherePosition] = useState<[number, number, number] | null>(null)
  const [isCameraMoving, setIsCameraMoving] = useState(false)
  const [cameraAnimationComplete, setCameraAnimationComplete] = useState(false)
  const [isCameraReset, setIsCameraReset] = useState(false)

  const [activeSpherePosition, setActiveSpherePosition] = useState<[number, number, number] | null>(null)
  const [isLargeSphereVisible, setIsLargeSphereVisible] = useState(false)
  const [isHumanModelVisible, setIsHumanModelVisible] = useState(false)
  const [isSunVisible, setIsSunVisible] = useState(true)
  const [areStarsVisible, setAreStarsVisible] = useState(true)


  const [visibleEarths, setVisibleEarths] = useState<EarthVisibilityState>({
    '5,0,0': true,
    '-5,0,0': true,
    '0,0,5': true,
    '0,0,-5': true,
  })

  const [visibleDashedSpheres, setVisibleDashedSpheres] = useState<{ [key: string]: boolean }>({
    '5,0,0': true,
    '-5,0,0': true,
    '0,0,5': true,
    '0,0,-5': true,
  })

  const sphereSize = 0.5

  const getHumanPosition = useCallback((targetPosition: [number, number, number] | null): [number, number, number] => {
    if (!targetPosition) return [0, 0, 0]

    const [offsetX, offsetY, offsetZ] = getHumanPositionOffset(targetPosition)
    return [targetPosition[0] + offsetX, targetPosition[1] + offsetY, targetPosition[2] + offsetZ]
  }, [])

  useEffect(() => {
    ;[
      '/models/earth/sky.png',
      '/models/earth/sun_texture.jpeg',
      '/earth_Earth_AlbedoTransparency.png',
      '/earth_Earth_Normal.png',
      '/earth_Earth_SpecularSmoothness.png',
      '/earth_Earth_Emission.png',
      '/earth_Cloud_AlbedoTransparency.png',
    ].forEach((path) => {
      if (!textureCache[path]) {
        textureCache[path] = textureLoader.load(path)
      }
    })

    useGLTF.preload('/models/earth/earth.gltf')
    useGLTF.preload('/models/earth/Figure.gltf')
  }, [])

  const handleSphereClick = useCallback((position: [number, number, number]) => {
    const resetAndPrepareAnimation = () => {
      setIsSunVisible(false)

      const newVisibleEarths: EarthVisibilityState = {
        '5,0,0': false,
        '-5,0,0': false,
        '0,0,5': false,
        '0,0,-5': false,
      }
      const posKey = position.join(',')
      newVisibleEarths[posKey] = true
      setVisibleEarths(newVisibleEarths)

      setVisibleDashedSpheres({
        '5,0,0': false,
        '-5,0,0': false,
        '0,0,5': false,
        '0,0,-5': false,
      })

      setIsLargeSphereVisible(false)
      setIsHumanModelVisible(false)
      setIsCameraMoving(false)
      setCameraAnimationComplete(false)

      setIsEarthOrbiting(false)
      setEarthPosition(position)

      setActiveSpherePosition(position)

      setIsCameraReset(true)
      setTargetSpherePosition(null)

      setTimeout(() => {
        setIsCameraReset(false)
        setAreStarsVisible(true)
        setTargetSpherePosition(position)
        setTimeout(() => {
          setIsCameraMoving(true)
        }, 20)
      })
    }

    resetAndPrepareAnimation()
  }, [])

  const handleSunClick = useCallback(() => {
    setActive((prev) => !prev)

    const resetToMainView = () => {
      setIsLargeSphereVisible(false)
      setIsHumanModelVisible(false)
      setIsCameraMoving(false)
      setCameraAnimationComplete(false)
      setActiveSpherePosition(null)

      setIsCameraReset(true)
      setTargetSpherePosition(null)

      setTimeout(() => {
        setIsCameraReset(false)

        setVisibleEarths({
          '5,0,0': true,
          '-5,0,0': true,
          '0,0,5': true,
          '0,0,-5': true,
        })

        setVisibleDashedSpheres({
          '5,0,0': true,
          '-5,0,0': true,
          '0,0,5': true,
          '0,0,-5': true,
        })

        setIsEarthOrbiting(true)
        setShouldEarthRotate(true)
        setIsSunVisible(true)
      }, 200)
    }

    requestAnimationFrame(resetToMainView)
  }, [])

  const handleCameraAnimationComplete = useCallback(() => {
    setCameraAnimationComplete(true)
    setShouldEarthRotate(false)
    setIsSunVisible(false)
    setAreStarsVisible(false) 

    // 클릭된 지구 위치 숨김
    if (activeSpherePosition) {
      const posKey = activeSpherePosition.join(',')
      setVisibleEarths((prev) => ({
        ...prev,
        [posKey]: false,
      }))
    }

    setIsLargeSphereVisible(true)
    setIsHumanModelVisible(true)
  }, [activeSpherePosition])

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [isHovered])

  return (
    <>
      <button
        onClick={() => router.push('/')}
        className='fixed left-0 z-10 text-black bg-white w-fit md:hover:opacity-50 active:opacity-50'>
        미래엔
      </button>

      <div className='fixed z-0 w-full h-screen bg-black'>
        <Scene camera={{ position: [0, 5, 8], fov: 75 }}>
          {process.env.NODE_ENV === 'development' && <Perf />}

          {areStarsVisible && <Stars count={2000} size={0.1} />}
          <ambientLight intensity={1.5} />
          <directionalLight position={[0.0, 0.0, 0.0]} castShadow intensity={Math.PI * 2} />
          <pointLight position={[0, 0, 0]} castShadow intensity={1} distance={2.0} />

          <Sun
            onClick={handleSunClick}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            visible={isSunVisible}
          />

          {/* 지구들 */}
          {visibleEarths['5,0,0'] && (
            <Earth
              position={isEarthOrbiting ? [4.9, 0, 0] : earthPosition[0] === 5 ? earthPosition : [5, 0, 0]}
              isOrbiting={isEarthOrbiting}
              speed={0.2}
              modelPath='/models/earth/earth.gltf'
              shouldRotate={shouldEarthRotate}
              visible={visibleEarths['5,0,0']}
            />
          )}
          {visibleEarths['-5,0,0'] && (
            <Earth
              position={isEarthOrbiting ? [-5, 0, 0] : earthPosition[0] === -5 ? earthPosition : [-5, 0, 0]}
              isOrbiting={isEarthOrbiting}
              speed={0.2}
              modelPath='/models/earth/earth.gltf'
              shouldRotate={shouldEarthRotate}
              visible={visibleEarths['-5,0,0']}
            />
          )}
          {visibleEarths['0,0,5'] && (
            <Earth
              position={isEarthOrbiting ? [0, 0, 5] : earthPosition[2] === 5 ? earthPosition : [0, 0, 5]}
              isOrbiting={isEarthOrbiting}
              speed={0.2}
              modelPath='/models/earth/earth.gltf'
              shouldRotate={shouldEarthRotate}
              visible={visibleEarths['0,0,5']}
            />
          )}
          {visibleEarths['0,0,-5'] && (
            <Earth
              position={isEarthOrbiting ? [0, 0, -5] : earthPosition[2] === -5 ? earthPosition : [0, 0, -5]}
              isOrbiting={isEarthOrbiting}
              speed={0.2}
              modelPath='/models/earth/earth.gltf'
              shouldRotate={shouldEarthRotate}
              visible={visibleEarths['0,0,-5']}
            />
          )}

          {/* 대시 스피어 */}
          {useMemo(
            () => (
              <>
                <DashedSphere
                  position={[5, 0, 0]}
                  size={sphereSize}
                  onClick={() => handleSphereClick([5, 0, 0])}
                  visible={visibleDashedSpheres['5,0,0']}
                />
                <DashedSphere
                  position={[-5, 0, 0]}
                  size={sphereSize}
                  onClick={() => handleSphereClick([-5, 0, 0])}
                  visible={visibleDashedSpheres['-5,0,0']}
                />
                <DashedSphere
                  position={[0, 0, 5]}
                  size={sphereSize}
                  onClick={() => handleSphereClick([0, 0, 5])}
                  visible={visibleDashedSpheres['0,0,5']}
                />
                <DashedSphere
                  position={[0, 0, -5]}
                  size={sphereSize}
                  onClick={() => handleSphereClick([0, 0, -5])}
                  visible={visibleDashedSpheres['0,0,-5']}
                />
              </>
            ),
            [handleSphereClick, sphereSize, visibleDashedSpheres],
          )}

          {activeSpherePosition && <LargeSphere position={activeSpherePosition} visible={isLargeSphereVisible} />}
          {targetSpherePosition && (
            <HumanModel position={getHumanPosition(targetSpherePosition)} visible={isHumanModelVisible} />
          )}

          <CameraController
            isCameraMoving={isCameraMoving}
            targetSpherePosition={targetSpherePosition}
            setIsCameraMoving={setIsCameraMoving}
            setCameraAnimationComplete={handleCameraAnimationComplete}
            setIsLargeSphereVisible={setIsLargeSphereVisible}
            setIsHumanModelVisible={setIsHumanModelVisible}
            cameraAnimationComplete={cameraAnimationComplete}
            isCameraReset={isCameraReset}
          />
        </Scene>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Home' } }
}
