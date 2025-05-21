import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'

type SceneProps = {
  mode: "real" | "thermal";
  temperature: number;
};

const Scene: React.FC<SceneProps> = ({ mode, temperature }) => {
  const pan = useGLTF("/models/heat/Scene/Scene.gltf");

  const fishMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);

  // 생선 색상 변화
  React.useEffect(() => {
    if (fishMaterialRef.current) {
      if (mode === "thermal") {
        const heatColor = `hsl(${Math.max(0, 60 - temperature)}, 100%, 50%)`;
        fishMaterialRef.current.color.set(heatColor);
      } else {
        fishMaterialRef.current.color.set("gray");
      }
    }
  }, [temperature, mode]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />

      <primitive object={pan.scene} position={[0, 0, 0]} />

    </>
  );
};

export default Scene;
