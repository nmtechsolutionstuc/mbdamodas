import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight IntersectionObserver-based scroll reveal hook.
 * Returns a ref to attach to the target element and a `visible` boolean
 * that flips true once the element enters the viewport (stays true).
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}
