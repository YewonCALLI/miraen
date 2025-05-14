import { useState } from 'react'
import SpaceScene from '@/scenes/SpaceScene' // 경로 수정

// Import the Season type from wherever it's defined (or define it locally)
type Season = 'spring' | 'summer' | 'fall' | 'winter'

export default function HomePage() {
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null)
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [isLockedToSurface, setIsLockedToSurface] = useState(false)

  const handleEarthClick = (position: [number, number, number], season: Season) => {
    setCameraTarget(position)
    setActiveSeason(season)
    setIsLockedToSurface(true)
  }

  const handleReset = () => {
    setCameraTarget(null)
    setActiveSeason(null)
    setIsLockedToSurface(false)
  }

  return (
    <div className="fixed inset-0 bg-black">
      <SpaceScene
        onEarthClick={handleEarthClick}
        cameraTarget={cameraTarget}
        activeSeason={activeSeason}
        isLockedToSurface={isLockedToSurface}
        onReset={handleReset}
      />
    </div>
  )
}