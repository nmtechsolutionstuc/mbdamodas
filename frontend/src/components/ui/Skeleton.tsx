interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius = '0.5rem', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #E8E3D5 25%, #F3F0E8 50%, #E8E3D5 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

// Skeleton para ItemCard
export function ItemCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', overflow: 'hidden' }}>
      <Skeleton height='0' style={{ aspectRatio: '3/4', height: 'auto', paddingBottom: '133%', borderRadius: 0 }} />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width='60%' height='0.75rem' />
        <Skeleton width='85%' height='1rem' />
        <Skeleton width='40%' height='1.1rem' />
      </div>
    </div>
  )
}

// Skeleton para filas de lista (admin, solicitudes)
export function ListRowSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Skeleton width='48px' height='48px' borderRadius='50%' style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width='45%' height='1rem' />
        <Skeleton width='65%' height='0.75rem' />
      </div>
    </div>
  )
}

// CSS de la animación (inyectado una sola vez)
const style = document.createElement('style')
style.textContent = `
  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`
if (!document.head.querySelector('[data-skeleton-styles]')) {
  style.setAttribute('data-skeleton-styles', '')
  document.head.appendChild(style)
}
