import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/drei'
import * as THREE from 'three'

export default function Thing(){
    const points = useMemo(() => {
        return [new THREE.Vector3(-10, 0, 0), new THREE.Vector3(0, 10, 0), new THREE.Vector3(10, 0, 0)]
      }, [])
    
      return (
        <line>
          <bufferGeometry setFromPoints={points} />
        </line>
      )

      return null
}