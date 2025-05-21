import React from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "@/components/heat/Scene";
import ModeToggle from "@/components/heat/ModeToggle";
import HeatControl from "@/components/heat/HeatControl";
import { useExperiment } from "@/components/heat/useExperiment";
import { OrbitControls } from '@react-three/drei';

const App = () => {
  const experiment = useExperiment();

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas  shadows camera={{ position: [0, 1, 1], fov: 50 }}>
        <Scene mode={experiment.mode} temperature={experiment.temperature} />
        <OrbitControls/>
      </Canvas>

      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <ModeToggle mode={experiment.mode} toggleMode={experiment.toggleMode} />
        <HeatControl temperature={experiment.temperature} heatUp={experiment.heatUp} />
      </div>
    </div>
  );
};

export default App;
