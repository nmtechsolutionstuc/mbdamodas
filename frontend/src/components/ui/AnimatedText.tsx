import { useCallback, useRef, useState } from 'react'

/**
 * HeroWords — animación palabra por palabra usando CSS keyframes.
 * Para texto que YA está en viewport al cargar (hero, paneles superiores).
 * No necesita IntersectionObserver — la animación arranca al montar.
 */
interface HeroWordsProps {
  text: string
  baseDelay?: number  // segundos antes de la primera palabra
  wordStep?: number   // segundos entre palabras
}

export function HeroWords({ text, baseDelay = 0.15, wordStep = 0.07 }: HeroWordsProps) {
  if (!text) return null
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${i}-${word}`}
          style={{
            display: 'inline-block',
            animation: 'mbdaFadeUp 0.5s ease both',
            animationDelay: `${baseDelay + i * wordStep}s`,
          }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  )
}

/**
 * AnimatedText — animación palabra por palabra activada por IntersectionObserver.
 * Para texto debajo del fold (scroll-triggered). Usa callback ref para funcionar
 * correctamente en elementos renderizados de forma condicional (datos async).
 */
interface AnimatedTextProps {
  text: string
  wordDelay?: number     // ms entre cada palabra
  initialDelay?: number  // ms antes de la primera
  fromY?: number         // píxeles de desplazamiento vertical inicial
  style?: React.CSSProperties
}

export function AnimatedText({
  text,
  wordDelay = 55,
  initialDelay = 0,
  fromY = 16,
  style,
}: AnimatedTextProps) {
  const [visible, setVisible] = useState(false)
  const obsRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((el: HTMLElement | null) => {
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null }
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
          obsRef.current = null
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 80px 0px' },
    )
    obsRef.current = obs
    obs.observe(el)
  }, [])

  if (!text) return null

  const words = text.split(' ')
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <span ref={ref as any}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : `translateY(${fromY}px)`,
            transition: `opacity 0.42s ease ${initialDelay + i * wordDelay}ms, transform 0.42s ease ${initialDelay + i * wordDelay}ms`,
            ...style,
          }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  )
}
