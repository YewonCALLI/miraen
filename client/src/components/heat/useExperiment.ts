import { useState } from "react";

export function useExperiment() {
  const [mode, setMode] = useState<"real" | "thermal">("real");
  const [temperature, setTemperature] = useState(25);

  const toggleMode = () => setMode(prev => (prev === "real" ? "thermal" : "real"));
  const heatUp = () => setTemperature(temp => Math.min(temp + 5, 100));

  return { mode, toggleMode, temperature, heatUp };
}
