import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, Preload } from '@react-three/drei'
import * as S from './styles' // SpinnerCover, Spinner styled-component 정의된 곳

type LoadingProps = {
  children: React.ReactNode
  camera?: any
  style?: React.CSSProperties
}

const Loading = ({ children, camera = { position: [0, 0, 5], fov: 75 }, style }: LoadingProps) => {
  const canvasRef = useRef(null)

  return (
    <Canvas
      ref={canvasRef}
      shadows
      camera={camera}
      style={{ width: '100vw', height: '100vh', ...style }}
    >
      <Suspense
        fallback={
          <Html center>
            <S.SpinnerCover>
              <S.Spinner />
            </S.SpinnerCover>
          </Html>
        }
      >
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  )
}

export default Loading
