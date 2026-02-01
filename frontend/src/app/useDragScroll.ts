import { useCallback, useMemo, useRef, useState } from 'react'

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true
  if (target.closest('[data-no-drag-scroll="true"]')) return true
  return false
}

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const stateRef = useRef<{
    pointerId: number | null
    startX: number
    startY: number
    startScrollLeft: number
    startScrollTop: number
    dragging: boolean
    moved: boolean
  }>(
    {
      pointerId: null,
      startX: 0,
      startY: 0,
      startScrollLeft: 0,
      startScrollTop: 0,
      dragging: false,
      moved: false,
    },
  )

  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (isInteractiveElement(e.target)) return

    const el = ref.current
    if (!el) return

    stateRef.current.pointerId = e.pointerId
    stateRef.current.startX = e.clientX
    stateRef.current.startY = e.clientY
    stateRef.current.startScrollLeft = el.scrollLeft
    stateRef.current.startScrollTop = el.scrollTop
    stateRef.current.dragging = true
    stateRef.current.moved = false

    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }

    setIsDragging(true)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return

    if (!stateRef.current.dragging || stateRef.current.pointerId !== e.pointerId) return

    const dx = e.clientX - stateRef.current.startX
    const dy = e.clientY - stateRef.current.startY

    if (!stateRef.current.moved) {
      const dist = Math.hypot(dx, dy)
      if (dist > 4) stateRef.current.moved = true
    }

    el.scrollLeft = stateRef.current.startScrollLeft - dx
    el.scrollTop = stateRef.current.startScrollTop - dy
  }, [])

  const end = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return

    if (stateRef.current.pointerId !== e.pointerId) return

    stateRef.current.dragging = false
    stateRef.current.pointerId = null

    try {
      el.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }

    setIsDragging(false)
  }, [])

  // Prevent accidental clicks after a drag.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!stateRef.current.moved) return
    // Don't prevent clicks on interactive elements
    if (isInteractiveElement(e.target)) return
    e.preventDefault()
    e.stopPropagation()
    stateRef.current.moved = false
  }, [])

  const bind = useMemo(
    () => ({
      ref,
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onClickCapture,
    }),
    [end, onClickCapture, onPointerDown, onPointerMove],
  )

  return { ref, bind, isDragging }
}
