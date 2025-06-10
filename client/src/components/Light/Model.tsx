// components/Model.tsx
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function Model(props: GroupProps) {
  const { scene } = useGLTF('models/Light/GLTFs/Light_Experiment.gltf')
  return <primitive object={scene} {...props} />
}
