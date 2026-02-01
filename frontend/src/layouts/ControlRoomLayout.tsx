import { Outlet, useSearchParams } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Footer } from '../components/Footer'

export function ControlRoomLayout() {
  const [params] = useSearchParams()
  const isFullscreen = params.get('fullscreen')
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/bg-frame.svg)' }}>
      <TopBar mode="CONTROL" className={isFullscreen ? 'hidden' : ''} />
      <div className="flex-1 bg-bg/80 backdrop-blur-[0.5px]">
        <Outlet />
      </div>
      <Footer className={isFullscreen ? 'hidden' : ''} />
    </div>
  )
}
