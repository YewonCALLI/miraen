import * as THREE from 'three';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Line } from '@react-three/drei';

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
};

export function Ray({
  origin,
  direction,
  length = 10,
  color = 'red',
  reflectSurfaces = [],
  depth = 0,
  maxDepth = 3,
}: RayProps) {
  const lineRef = useRef<any>(null);
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

  const points = useMemo(() => {
    return [start, end];
  }, [start, end]);

  const positions = new Float32Array([
    start.x, start.y, start.z,
    end.x, end.y, end.z,
  ]);

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

<line>
    <bufferGeometry attach="geometry">
      <bufferAttribute
        attach="attributes-position"
        count={2}
        array={positions}
        itemSize={3}
      />
    </bufferGeometry>
    <lineBasicMaterial
      attach="material"
      color={new THREE.Color(7, 0, 0.5)}
      transparent
      opacity={0.3}
      toneMapped={false}
    />
  </line>

  {/* Sharp core */}
  <line>
    <bufferGeometry attach="geometry">
      <bufferAttribute
        attach="attributes-position"
        count={2}
        array={positions}
        itemSize={3}
      />
    </bufferGeometry>
    <lineBasicMaterial
      attach="material"
      color="red"
    />
  </line>
      <pointLight position={origin.toArray()} color="red" intensity={4} distance={5} />
      {reflection}
    </>
  );
}
