export function GroundStars({ opacity = 1 }: { opacity?: number }) {
    return <points>{/* 구현 생략 - 실제 별 데이터 사용 가능 */}</points>
  }
  
  export function Constellations({ season, opacity = 1 }: { season: string; opacity?: number }) {
    return <group>{/* 별자리 라인 및 포인트 표시 */}</group>
  }
  
  export function Horizon({ opacity = 1 }: { opacity?: number }) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[50, 50, 0.2, 64]} />
        <meshStandardMaterial color="#222" transparent opacity={opacity} />
      </mesh>
    )
  }
  