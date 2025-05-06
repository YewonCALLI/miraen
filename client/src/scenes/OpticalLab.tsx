import { Ray } from '../components/Light/Ray';
import { Mirror } from '../components/Light/Mirror';
import { LensConvex } from '../components/Light/LensConvex';
import { LensConcave } from '../components/Light/LensConcave';
import * as THREE from 'three';
import { useMemo } from 'react';
import { Reflector } from '@react-three/drei';

// Define interface for OpticalLab props
interface OpticalLabProps {
  mode: 'direct' | 'reflection' | 'refraction';
  lensType?: 'convex' | 'concave';
}

export function OpticalLab({ mode, lensType = 'convex' }: OpticalLabProps) {
  // 거울 속성 정의
  const mirrorPosition = new THREE.Vector3(1, 0, 0);
  const mirrorRotation = new THREE.Euler(Math.PI/2, 5*Math.PI/4, 0);
  
  const mirrorNormal = useMemo(() => {
    const normal = new THREE.Vector3(0, 0, 1);
    normal.applyEuler(mirrorRotation);
    return normal;
  }, []);

  // 렌즈 위치
  const lensPosition = new THREE.Vector3(-3, 0, 0);

  // 반사/굴절 표면 정의
  const reflectSurfaces = useMemo(() => {
    if (mode === 'reflection') {
      return [{
        position: mirrorPosition,
        normal: mirrorNormal,
        type: 'mirror' as const
      }];
    } else if (mode === 'refraction') {
      return [{
        position: lensPosition,
        normal: new THREE.Vector3(-1, 0, 0), // 렌즈의 왼쪽 표면 (빛이 왼쪽에서 오른쪽으로 진행)
        type: 'lens' as const,
        refractiveIndex: 1.5,  // 유리의 굴절률
        lensType: lensType
      }];
    }
    return []; // 직진 모드일 때는 표면 없음
  }, [mode, mirrorPosition, mirrorNormal, lensPosition, lensType]);

  return (
    <>
      {/* 모드에 따라 다른 광선 설정 */}
      {mode === 'direct' && (
        <>
          {/* 직진하는 광선들 */}
          <Ray 
            origin={new THREE.Vector3(-5, 0, 0)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={[]}
            color="red"
            length={10}
          />
        </>
      )}

      {mode === 'reflection' && (
        <>
          {/* 반사하는 광선들 */}
          <Ray 
            origin={new THREE.Vector3(-5, 0, 0)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            mirrorRotation={mirrorRotation}
            color="red"
          />
          <Ray 
            origin={new THREE.Vector3(-5, 0, 0.1)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            mirrorRotation={mirrorRotation}
            color="red"
          />
          <Ray 
            origin={new THREE.Vector3(-5, 0, -0.1)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            mirrorRotation={mirrorRotation}
            color="red"
          />

          {/* 거울 */}
          <Reflector
            resolution={2048}
            args={[1.8, 3]}
            mirror={0.9}
            mixStrength={0.5}
            mixBlur={0}
            blur={[0, 0]}
            rotation={[Math.PI / 2, 5 * Math.PI / 4, 0]}
            position={[1, 0, 0]}
          >
            {(Material: React.ElementType, props) => (
              <Material color="white" metalness={0.8} roughness={0.2} {...props} />
            )}
          </Reflector>
        </>
      )}

      {mode === 'refraction' && (
        <>
          {/* 굴절하는 광선들 - 다양한 위치에서 발사하여 렌즈 효과 확인 */}
          <Ray 
            origin={new THREE.Vector3(-5, 0, 0)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            color="red"
          />
          <Ray 
            origin={new THREE.Vector3(-5, 0.5, 0)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            color="red"
          />
          <Ray 
            origin={new THREE.Vector3(-5, -0.5, 0)} 
            direction={new THREE.Vector3(1, 0, 0)} 
            reflectSurfaces={reflectSurfaces}
            color="red"
          />
          

          {/* 렌즈 - 볼록렌즈 */}
          {lensType === 'convex' && (
            <LensConvex position={lensPosition} />
          )}
          {lensType === 'concave' && (
            <LensConcave position={lensPosition} />
          )}
        </>
      )}
    </>
  );
}
