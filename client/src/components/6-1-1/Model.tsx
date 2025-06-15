// components/Model.tsx
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function Model(props: GroupProps) {
  const { scene } = useGLTF('models/6-1-1/Dirty/Streinergltf.gltf')
  return <primitive object={scene} {...props} />
}