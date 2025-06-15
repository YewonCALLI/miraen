// pages/index.tsx or App.tsx
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { LensFlare } from "@andersonmancini/lens-flare";
import Model from '../components/5-2-3/Model'
import Scene from '@/components/canvas/Scene'
import { EffectComposer } from '@react-three/postprocessing';

export default function Home() {
  return (
    <div className="w-screen h-screen bg-blue flex flex-col">
      <Scene 
        camera={{ position: [5, 10, 15], fov: 50, far:  1000}}
        shadows // 그림자 활성화
        shadowMap={{ enabled: true, type: 'PCFSoftShadowMap' }} // 부드러운 그림자
      >
        <ambientLight intensity={2.0} />  
        <Model scale={0.1} position={[0, 0, 0]} />
        <OrbitControls />
        <EffectComposer>
            <LensFlare dirtTextureFile={"/models/5-2-3/coast.png"} />
         </EffectComposer>
      </Scene>
    </div>
  )
}
