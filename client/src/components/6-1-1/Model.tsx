import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    BathroomDoor_BathroomDoor1: THREE.Mesh
    Walls10: THREE.Mesh
  }
  materials: {
    lambert3: THREE.MeshPhysicalMaterial
  }
}

export const Model = (props: JSX.IntrinsicElements['group']) => {
  const { nodes, materials } = useGLTF('/models/6-1-1/Dirty/opt.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.BathroomDoor_BathroomDoor1.geometry}
          material={materials.lambert3}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Walls10.geometry}
          material={materials.lambert3}
          position={[0, 40.097, 0]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/6-1-1/Dirty/opt.glb')
