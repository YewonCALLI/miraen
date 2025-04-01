import Scene from '@/components/canvas/Scene'
import { OrbitControls, Sphere } from '@react-three/drei'
import { useRouter } from 'next/router'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

function DashedSphere({ position = [0, 0, 0], size = 0.1, color = "#000000", dashSize = 0.2, gapSize = 0.1, onClick }) {
  const groupRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const currentColor = isHovered ? "#FF0000" : color
  
  // Hover Effect 
  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => { document.body.style.cursor = 'auto' }
  }, [isHovered])
  
  const dashedCircles = useMemo(() => {
    const circles = []
    const segments = 32
    const material = new THREE.LineDashedMaterial({
      color: currentColor,
      dashSize: dashSize,
      gapSize: gapSize,
      transparent: true,
    })

    const curve = new THREE.EllipseCurve(
      0, 0, size, size, 0, 2 * Math.PI, false, 0  
    )
    
    const points = curve.getPoints(segments)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    const circle = new THREE.Line(geometry, material.clone())
    circle.computeLineDistances()
    circles.push(circle)
    
    return circles
  }, [size, currentColor, dashSize, gapSize])

  return (
    <group 
      ref={groupRef}
      position={position} 
      onClick={onClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      raycast={(raycaster, intersects) => {
        const worldPosition = new THREE.Vector3()
        groupRef.current.getWorldPosition(worldPosition)
        
        const rayDirection = new THREE.Vector3()
        rayDirection.subVectors(worldPosition, raycaster.ray.origin).normalize()
        
        const rayPointAtDistance = new THREE.Vector3()
        rayPointAtDistance.copy(raycaster.ray.origin)
          .add(rayDirection.multiplyScalar(raycaster.near))
        
        const distanceToRay = worldPosition.distanceTo(rayPointAtDistance)
        
        if (distanceToRay <= size * 1.0) {
          intersects.push({
            distance: worldPosition.distanceTo(raycaster.ray.origin),
            object: groupRef.current,
            point: new THREE.Vector3().copy(worldPosition)
          })
        }
      }}
    >
      {dashedCircles.map((circle, index) => (
        <primitive key={index} object={circle} />
      ))}
    </group>
  )
}

function Earth({ position = [0, 0, 0], size = 0.5, isOrbiting = true, speed = 0.5 }) {
  const earthRef = useRef()
  
  useFrame((state) => {
    if (earthRef.current && isOrbiting) {
      const time = state.clock.getElapsedTime()
      earthRef.current.position.x = Math.cos(time * speed) * 5
      earthRef.current.position.z = -Math.sin(time * speed) * 5 //반시계 방향
    }
  })

  return (
    <Sphere
      ref={earthRef}
      args={[size, 32, 32]}
      position={position}>
      <meshStandardMaterial color="green" />
    </Sphere>
  )
}

export default function Page(props) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [active, setActive] = useState(false)
  const [earthPosition, setEarthPosition] = useState([5, 0, 0])
  const [isEarthOrbiting, setIsEarthOrbiting] = useState(true)
  
  const handleSphereClick = useCallback((position) => {
    setEarthPosition(position)
    setIsEarthOrbiting(false)
  }, [])
  
  const handleSunClick = useCallback(() => {
    setActive(!active)
    setIsEarthOrbiting(true)
  }, [active])

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => { document.body.style.cursor = 'auto' }
  }, [isHovered])

  return (
    <>
      <button
        onClick={() => router.push('/')}
        className='fixed left-0 z-10 text-black bg-white w-fit md:hover:opacity-50 active:opacity-50'>
        미래엔
      </button>

      <div className='fixed z-0 w-full h-screen'>
        <Scene camera={{position: [0, 5, 8]}}>
          <Perf />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} />
          
          <Sphere
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            onClick={handleSunClick}
            args={[1, 32, 32]}
            position={[0, 0, 0]}>
            <meshStandardMaterial 
              color={isHovered ? 'hotpink' : 'orange'} 
              emissive="orange" 
              emissiveIntensity={0.5} 
            />
          </Sphere>
          
          <Earth 
            position={isEarthOrbiting ? [4.9, 0, 0] : earthPosition}
            size={0.4}
            isOrbiting={isEarthOrbiting}
            speed={0.5}
          />
          
          <DashedSphere 
            position={[5, 0, 0]} 
            size={0.5} 
            onClick={() => handleSphereClick([5, 0, 0])} 
          />
          <DashedSphere 
            position={[-5, 0, 0]} 
            size={0.5} 
            onClick={() => handleSphereClick([-5, 0, 0])} 
          />
          <DashedSphere 
            position={[0, 0, 5]} 
            size={0.5} 
            onClick={() => handleSphereClick([0, 0, 5])} 
          />
          <DashedSphere 
            position={[0, 0, -5]} 
            size={0.5} 
            onClick={() => handleSphereClick([0, 0, -5])} 
          />
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={0} maxDistance={100} />
        </Scene>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Home' } }
}