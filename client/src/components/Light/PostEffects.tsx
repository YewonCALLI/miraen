import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.0}
        mipmapBlur
      />
    </EffectComposer>
  );
}
