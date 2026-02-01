import { useEffect, useState } from 'react'

export function useOnline() {
  const [online, setOnline] = useState(() => {
    return typeof navigator === 'undefined' ? true : navigator.onLine
  })

  useEffect(() => {
    function onOnline() {
      setOnline(true)
    }
    function onOffline() {
      setOnline(false)
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return online
}
