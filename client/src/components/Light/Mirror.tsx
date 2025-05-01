import { MeshProps, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { BackSide, DoubleSide, FrontSide, Mesh, MeshStandardMaterial } from 'three';

export function Mirror(props: MeshProps) {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useThree();
  
  useEffect(() => {
    if (meshRef.current && scene.environment) {
      // 필요한 경우 재질에 환경 맵을 적용
      // 타입스크립트에서는 Material 기본 타입에 envMap이 없어서 타입 단언 필요
      if (meshRef.current.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(mat => {
            // MeshStandardMaterial과 하위 클래스들은 envMapIntensity를 가짐
            if ('envMapIntensity' in mat) {
              // 타입 단언을 통해 환경 맵 설정
              (mat as MeshStandardMaterial).envMap = scene.environment;
              mat.needsUpdate = true;
            }
          });
        } else if ('envMapIntensity' in meshRef.current.material) {
          // 타입 단언을 통해 환경 맵 설정
          (meshRef.current.material as MeshStandardMaterial).envMap = scene.environment;
          meshRef.current.material.needsUpdate = true;
        }
      }
    }
  }, [scene.environment]);

  return (
    <mesh ref={meshRef} {...props} receiveShadow castShadow>
      <planeGeometry args={[3.2, 3]} />
      <meshPhysicalMaterial
        metalness={0.9}
        roughness={0}
        reflectivity={1}
        clearcoat={0}
        clearcoatRoughness={0}
        side={FrontSide}
        envMapIntensity={0.005}
        emissive="black"
        sheen={1}
      />


    </mesh>
  );
}