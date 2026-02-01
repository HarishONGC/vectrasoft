import { useEffect, useState } from 'react'

export function useInView<T extends Element>(
  ref: React.RefObject<T | null>,
  {
    rootMargin = '200px',
    threshold = 0.01,
  }: {
    rootMargin?: string
    threshold?: number
  } = {},
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e) return
        setInView(Boolean(e.isIntersecting))
      },
      { rootMargin, threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, rootMargin, threshold])

  return inView
}
