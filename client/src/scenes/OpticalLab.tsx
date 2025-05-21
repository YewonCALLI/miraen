import { Ray } from '../components/Light/Ray';
import { Mirror } from '../components/Light/Mirror';
import { LensConvex } from '../components/Light/LensConvex';
import { LensConcave } from '../components/Light/LensConcave';
import * as THREE from 'three';
import { useMemo } from 'react';
import { Reflector } from '@react-three/drei';

interface OpticalLabProps {
  mode: 'direct' | 'reflection' | 'refraction';
  lensType?: 'convex' | 'concave';
  rayVisible?: boolean;
}

export function OpticalLab({
  mode,
  lensType = 'convex',
  rayVisible = true,
}: OpticalLabProps) {
  const mirrorPosition = new THREE.Vector3(1, 0, 0);
  const mirrorRotation = new THREE.Euler(Math.PI / 2, 5 * Math.PI / 4, 0);

  const mirrorNormal = useMemo(() => {
    const normal = new THREE.Vector3(0, 0, 1);
    normal.applyEuler(mirrorRotation);
    return normal;
  }, []);

  const lensPosition = new THREE.Vector3(-3, 0, 0);

  const reflectSurfaces = useMemo(() => {
    if (mode === 'reflection') {
      return [
        {
          position: mirrorPosition,
          normal: mirrorNormal,
          type: 'mirror' as const,
        },
      ];
    } else if (mode === 'refraction') {
      return [
        {
          position: lensPosition,
          normal: new THREE.Vector3(-1, 0, 0),
          type: 'lens' as const,
          refractiveIndex: 1.5,
          lensType: lensType,
        },
      ];
    }
    return [];
  }, [mode, mirrorPosition, mirrorNormal, lensPosition, lensType]);

  return (
    <>
      {/* 직진 모드 */}
      {mode === 'direct' && rayVisible && (
        <Ray
          origin={new THREE.Vector3(-5, 0, 0)}
          direction={new THREE.Vector3(1, 0, 0)}
          reflectSurfaces={[]}
          color="red"
          length={10}
        />
      )}

      {/* 반사 모드 */}
      {mode === 'reflection' && (
        <>
          {rayVisible && (
            <>
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
            </>
          )}
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
              <Material
                color="white"
                metalness={0.8}
                roughness={0.2}
                {...props}
              />
            )}
          </Reflector>
        </>
      )}

      {/* 굴절 모드 */}
      {mode === 'refraction' && (
        <>
          {rayVisible && (
            <>
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
            </>
          )}

          {/* 렌즈 */}
          {lensType === 'convex' && <LensConvex position={lensPosition} />}
          {lensType === 'concave' && <LensConcave position={lensPosition} />}
        </>
      )}
    </>
  );
}
