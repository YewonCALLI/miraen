import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import { MeshTransmissionMaterial, AccumulativeShadows, RandomizedLight } from '@react-three/drei'

interface RealisticWaterProps {
  beakerRadius?: number;
  waterLevel?: number;
  position?: [number, number, number];
}

export const RealisticWater: React.FC<RealisticWaterProps> = ({
  beakerRadius = 0.8,
  waterLevel = 0.9,
  position = [0, 0, 0]
}) => {
  const waterGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      beakerRadius,
      beakerRadius,
      waterLevel,
      64,
      32
    )
  }, [beakerRadius, waterLevel])


  return (
    
    <mesh geometry={waterGeometry} position={position}>
    <MeshTransmissionMaterial
        transmission={1}
        transparent={true}
        opacity={0.1}
        roughness={0.9}
        thickness={0.4}
        ior={1.33}
        chromaticAberration={0.02}
        anisotropy={0.1}
        distortion={0.05}
        temporalDistortion={0.1}
        clearcoat={1}
        attenuationColor="#000000"
        attenuationDistance={0.6}
        background={new THREE.Color('#ff0000')}
    />
    </mesh>
  )
}
