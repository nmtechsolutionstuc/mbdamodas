import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1E1914' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#6b7280' }}>Recargá la página para continuar.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
