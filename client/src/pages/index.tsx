import { useState } from 'react'
import SpaceScene from '@/scenes/SpaceScene'

export default function HomePage() {
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null)
  const [activeSeason, setActiveSeason] = useState<string | null>(null)
  const [isLockedToSurface, setIsLockedToSurface] = useState(false)

  const handleEarthClick = (position: [number, number, number], season: string) => {
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
