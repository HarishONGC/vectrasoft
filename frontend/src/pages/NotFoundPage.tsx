import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { TopBar } from '../components/TopBar'
import { Footer } from '../components/Footer'

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/bg-frame.svg)' }}>
      <TopBar mode="CONTROL" />
      <div className="flex-1 grid place-items-center p-6 bg-bg/80 backdrop-blur-[0.5px]">
        <div className="text-center">
        <div className="text-2xl font-semibold">Page not found</div>
        <div className="mt-1 text-sm text-muted">The requested route does not exist.</div>
        <div className="mt-4">
          <Link to="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
