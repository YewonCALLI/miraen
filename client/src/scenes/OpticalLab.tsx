import { Ray } from '../components/Light/Ray';
import { Mirror } from '../components/Light/Mirror';
import { LensConvex } from '../components/Light/LensConvex';
import { LensConcave } from '../components/Light/LensConcave';
import * as THREE from 'three';
import { useMemo } from 'react';

export function OpticalLab() {
  // 거울 속성 정의
  const mirrorPosition = new THREE.Vector3(1, 0, 0);
  const mirrorRotation = new THREE.Euler(Math.PI/2, 5*Math.PI/4, 0);
  
  const mirrorNormal = useMemo(() => {
    const normal = new THREE.Vector3(0, 0, 1);
    normal.applyEuler(mirrorRotation);
    return normal;
  }, []);

  // 렌즈 위치
  const convexLensPosition = new THREE.Vector3(3, 0, 0);
  const concaveLensPosition = new THREE.Vector3(6, 0, 0);

  // 반사 표면 정의
  const reflectSurfaces = useMemo(() => [
    {
      position: mirrorPosition,
      normal: mirrorNormal,
      type: 'mirror' as const
    },
    // 필요하다면 렌즈의 반사/굴절 표면도 추가 가능
    // {
    //   position: convexLensPosition,
    //   normal: new THREE.Vector3(-1, 0, 0), // 렌즈의 방향에 따라 조정
    //   type: 'lens' as const
    // }
  ], [mirrorPosition, mirrorNormal]);

  return (
    <>
      {/* 광선 - 반사 표면 정보를 전달 */}

      <Ray 
        origin={new THREE.Vector3(-5, 0, 0)} 
        direction={new THREE.Vector3(1, 0, 0)} 
        reflectSurfaces={reflectSurfaces}
        color="red"
      />
      <Ray 
        origin={new THREE.Vector3(-5, 0.3, 0)} 
        direction={new THREE.Vector3(1, 0, 0)} 
        reflectSurfaces={reflectSurfaces}
        color="red"
      />

      {/* 거울 */}
      <Mirror position={mirrorPosition} rotation={mirrorRotation} />

      {/* 볼록렌즈 */}
      <LensConvex position={convexLensPosition} />

      {/* 오목렌즈 */}
      <LensConcave position={concaveLensPosition} />
    </>
  );
}