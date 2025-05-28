import { useState, useEffect, useRef } from 'react'
import { Html, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Flame from './Flame'
import CandleLight from './CandleLight'


export default function Experiment() {
  const [oxygenSupplied, setOxygenSupplied] = useState(false)
  const [flameLeftOn, setFlameLeftOn] = useState(true)
  const [flameRightOn, setFlameRightOn] = useState(true)
  const oxygenRef = useRef<THREE.Mesh>(null)
  const { scene } = useGLTF('/models/Candle/Candle_experiment.gltf')

  useEffect(() => {
    if (scene.children[0]) {
      scene.remove(scene.children[0])
    }
  }, [scene])

  return (
    <>
      <primitive object={scene} scale={5.0} position={[0,-5,0]}/>
      <Flame position={[-0.57, 0.3, 0]} />
      <CandleLight position={[-0.57, 0.3, 0]} />

      <Flame position={[0.41, 0.3, 0]} />
      <CandleLight position={[0.41, 0.3, 0]} />
    </>
  )
}
