import { useRecoilValue } from 'recoil'
import { uiTextState } from './state'

export default function ExperimentUI() {
  const uiText = useRecoilValue(uiTextState)

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontSize: '1.2rem',
      pointerEvents: 'none'
    }}>
      {uiText}
    </div>
  )
}
