// components/Model.tsx
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function Model(props: GroupProps) {
  const { scene } = useGLTF('models/5-2-3/Wether.gltf')
  
  useEffect(() => {
    // scene.children[0] 제거
    if (scene.children.length > 0) {
      const firstChild = scene.children[1]
      scene.remove(firstChild)
      
      // 메모리 누수 방지를 위한 정리
      if (firstChild instanceof THREE.Mesh) {
        firstChild.geometry?.dispose()
        if (firstChild.material) {
          if (Array.isArray(firstChild.material)) {
            firstChild.material.forEach(material => material.dispose())
          } else {
            firstChild.material.dispose()
          }
        }
      }
    }
    
    // 나머지 모든 메시에 그림자 설정 적용
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // 재질이 있는 경우 그림자 렌더링 최적화
        if (child.material) {
          child.material.shadowSide = THREE.FrontSide
        }
      }
    })
  }, [scene])
  
  return <primitive object={scene} {...props} />
}