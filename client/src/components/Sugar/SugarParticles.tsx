import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUM_PARTICLES = 100
const GRAVITY = -9.8 
const WATER_LEVEL = 0.8

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  age: number
  delay: number
  floatDelay: number
  state: 'falling' | 'floating' | 'sinking'
  opacity: number
  scale: number
}

export function SugarParticles({ startPosition = [0, 2, 0] }) {
  const particles = useRef<THREE.InstancedMesh>(null!)
  const dummy = new THREE.Object3D()

  const velocities = useRef<Particle[]>((() => {
  const arr: Particle[] = []
  for (let i = 0; i < NUM_PARTICLES; i++) {
    const jitter = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      0,
      (Math.random() - 0.5) * 0.3
    )

    arr.push({
      pos: new THREE.Vector3(
        startPosition[0] + (Math.random() - 0.5) * 0.6,
        startPosition[1],                
        startPosition[2] + (Math.random() - 0.5) * 0.6
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 1.2 + 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      age: 0,
      delay: Math.random() * 0.4,
      floatDelay: 0.3 + Math.random() * 0.5,
      state: 'falling',
      opacity: 1,
      scale: 0.7 + Math.random() * 0.6,
    })
  }
  return arr
})())


  useFrame((_, delta) => {
    velocities.current.forEach((p, i) => {
      p.age += delta

      if (p.age < p.delay) {
        return
      }

      if (p.state === 'falling') {
        p.vel.y += GRAVITY * delta
        p.pos.addScaledVector(p.vel, delta)

        if (p.pos.y <= WATER_LEVEL) {
          p.pos.y = WATER_LEVEL
          p.state = 'floating'
          p.age = 0
        }
      } else if (p.state === 'floating') {
        if (p.age > p.floatDelay) {
          p.state = 'sinking'
          p.age = 0
        }
      } else if (p.state === 'sinking') {
        p.pos.y -= 0.2 * delta
        p.opacity -= 0.7 * delta
        p.scale -= 0.6 * delta

        if (p.opacity < 0) p.opacity = 0
        if (p.scale < 0) p.scale = 0.001
      }


      dummy.position.copy(p.pos)
      dummy.scale.set(p.scale, p.scale, p.scale)
      dummy.updateMatrix()
      particles.current.setMatrixAt(i, dummy.matrix)
    })

    particles.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={particles} args={[null, null, NUM_PARTICLES]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial color="white" transparent opacity={0.4} />
    </instancedMesh>
  )
}
