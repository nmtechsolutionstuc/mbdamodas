import { useCallback, useRef, useState } from 'react'

/**
 * Scroll-reveal hook using a callback ref instead of useRef + useEffect.
 *
 * WHY: useEffect + useRef only runs once on mount. If the target element is
 * conditionally rendered (depends on async data), the element doesn't exist
 * at that point and the IntersectionObserver is never attached → content
 * stays hidden forever.
 *
 * With a callback ref, React calls the function whenever the DOM node is
 * attached or detached, so the observer is always set up at the right time.
 *
 * rootMargin '0px 0px 80px 0px' — triggers 80 px *before* the element
 * enters the viewport so the animation starts before the user reaches it.
 */
export function useScrollReveal(threshold = 0.08) {
  const [visible, setVisible] = useState(false)
  const obsRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      // Tear down any previous observer (element unmounted or ref reassigned)
      if (obsRef.current) {
        obsRef.current.disconnect()
        obsRef.current = null
      }
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true)
            obs.disconnect()
            obsRef.current = null
          }
        },
        { threshold, rootMargin: '0px 0px 80px 0px' },
      )
      obsRef.current = obs
      obs.observe(el)
    },
    [threshold],
  )

  return { ref, visible }
}
