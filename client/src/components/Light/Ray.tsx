import * as THREE from 'three';
import { useRef, useMemo, useEffect, useState } from 'react';

type RayProps = {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  length?: number;
  color?: string;
  reflectSurfaces?: {
    position: THREE.Vector3;
    normal: THREE.Vector3;
    type: 'mirror' | 'lens';
  }[];
  depth?: number;
  maxDepth?: number;
  mirrorRotation?: THREE.Euler;

};

export function Ray({
  origin,
  direction,
  length = 10,
  color = 'red',
  reflectSurfaces = [],
  depth = 0,
  maxDepth = 3,
  mirrorRotation
}: RayProps) {
  const [reflection, setReflection] = useState<JSX.Element | null>(null);

  const start = useMemo(() => origin.clone(), [origin]);
  const normalizedDir = useMemo(() => direction.clone().normalize(), [direction]);

  const { end, reflectionData } = useMemo(() => {
    const tempEnd = start.clone().add(normalizedDir.clone().multiplyScalar(length));
    const ray = new THREE.Ray(start.clone(), normalizedDir.clone());

    let closestIntersection = null;
    let closestDistance = Infinity;
    let reflectionNormal = null;
    let reflectionType = null;

    for (const surface of reflectSurfaces) {
      const planeNormal = surface.normal.clone();
      const planePoint = surface.position.clone();
      const denominator = planeNormal.dot(ray.direction);

      if (Math.abs(denominator) < 0.000001) continue;

      const t = planeNormal.dot(planePoint.clone().sub(ray.origin)) / denominator;

      if (t > 0 && t < length && t < closestDistance) {
        closestDistance = t;
        closestIntersection = ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
        reflectionNormal = planeNormal;
        reflectionType = surface.type;
      }
    }

    if (closestIntersection) {
      return {
        end: closestIntersection,
        reflectionData: {
          point: closestIntersection,
          normal: reflectionNormal,
          type: reflectionType,
          distance: closestDistance,
        },
      };
    }

    return { end: tempEnd, reflectionData: null };
  }, [start, normalizedDir, length, reflectSurfaces]);

  const position = useMemo(() => start.clone().add(end).multiplyScalar(0.5), [start, end]);
  const lengthBetween = useMemo(() => start.distanceTo(end), [start, end]);
  const quaternion = useMemo(() => {
    const dir = end.clone().sub(start).normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), // 기본 cylinder 방향
      dir
    );
  }, [start, end]);

  useEffect(() => {
    if (reflectionData && depth < maxDepth) {
      let reflectedDirection;

      if (reflectionData.type === 'mirror') {
        reflectedDirection = normalizedDir
          .clone()
          .sub(reflectionData.normal.clone().multiplyScalar(2 * normalizedDir.dot(reflectionData.normal)));
      } else {
        reflectedDirection = normalizedDir.clone();
      }

      setReflection(
        <Ray
          origin={reflectionData.point.clone()}
          direction={reflectedDirection}
          length={length - reflectionData.distance}
          color={color}
          reflectSurfaces={reflectSurfaces}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      );
    }
  }, [reflectionData, depth, maxDepth, normalizedDir, length, color, reflectSurfaces]);

  return (
    <>
      {/* 레이저 본체: Cylinder */}
      <mesh position={position} quaternion={quaternion}>
        <cylinderGeometry args={[0.001, 0.001, lengthBetween, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>

      {/* 시작 지점 광원 */}
      <pointLight position={origin.toArray()} color={color} intensity={1} distance={2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.001} />

      {/* 반사 지점 광원 + dot */}
      {reflectionData && (
        <mesh
          position={reflectionData.point.clone().add(reflectionData.normal.clone().multiplyScalar(0.001))}
          rotation={mirrorRotation}
        >
          <planeGeometry args={[3.2, 0.02]} />
          <meshStandardMaterial
            color="red"
            opacity={0.2}
            transparent
            toneMapped={false}
            emissive={"red"}
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* 반사 재귀 */}
      {reflection}
    </>
  );
}
