import { useMemo } from 'react';
import * as THREE from 'three';

type LensConcaveProps = {
  position: THREE.Vector3;
  radius?: number;
  height?: number;
  thickness?: number;
};

export function LensConcave({
  position,
  radius = 1,
  height = 2,
  thickness = 0.2
}: LensConcaveProps) {
  const geometry = useMemo(() => {
    const h = height / 2;
  
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.39, -h, 0),
      new THREE.Vector3(0.37, -h + 0.1, 0),
      new THREE.Vector3(0.22, -h / 3, 0),
      new THREE.Vector3(0.2, 0, 0),
      new THREE.Vector3(0.22, h / 3, 0),
      new THREE.Vector3(0.37, h - 0.1, 0),
      new THREE.Vector3(0.39, h, 0),
    ]);
  
    const curvePoints: THREE.Vector2[] = curve.getPoints(50).map(p => new THREE.Vector2(p.x, p.y));
  
    return new THREE.LatheGeometry(curvePoints, 64);
  }, [height]);
  
  
  
  return (
    <mesh position={position.toArray()}>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial
        color="#a7c5eb"
        transparent
        opacity={0.6}
        roughness={0.05}
        metalness={0}
        ior={1.5}
        transmission={1}
        thickness={thickness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
