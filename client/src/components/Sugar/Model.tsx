// components/Model.tsx
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function Model(props: GroupProps) {
  const { scene } = useGLTF('models/Sugar/Beaker_scene.gltf')
  console.log(scene.children)
  return <primitive object={scene} {...props} />
}
