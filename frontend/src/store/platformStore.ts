import { create } from 'zustand'

export type MenuItemConfig = { active: boolean; title?: string; description?: string }
export type MenuConfig = Record<string, MenuItemConfig>

export const DEFAULT_MENU: Required<Record<string, MenuItemConfig>> = {
  enviar:      { active: true, title: 'Enviar prendas',       description: '' },
  solicitudes: { active: true, title: 'Mis solicitudes',      description: '' },
  reservas:    { active: true, title: 'Mis reservas',         description: '' },
  tiendas:     { active: true, title: 'Mis mini-tiendas',     description: '' },
  perfil:      { active: true, title: 'Mi perfil',            description: '' },
}

// ── Persistencia del nombre de plataforma ─────────────────────────────────────
// Se guarda en localStorage para evitar el flash de "MBDA Market" en el primer
// render cuando mini-tiendas está desactivado. El valor se actualiza cada vez
// que la API responde, así siempre queda sincronizado.
const LS_KEY = 'mbda_mini_shops_enabled'

function readCached(): boolean {
  try {
    const v = localStorage.getItem(LS_KEY)
    // Si nunca se guardó (primera visita), asumimos desactivado (más conservador)
    return v === null ? false : v === 'true'
  } catch {
    return false
  }
}

function writeCached(enabled: boolean) {
  try { localStorage.setItem(LS_KEY, String(enabled)) } catch { /* noop */ }
}

const _initEnabled = readCached()

interface PlatformState {
  miniShopsEnabled: boolean
  platformName: string
  storeInfoLoaded: boolean
  menuConfig: MenuConfig
  menuConfigLoaded: boolean
  setMiniShopsEnabled: (enabled: boolean) => void
  setMenuConfig: (config: MenuConfig) => void
}

export const usePlatformStore = create<PlatformState>()(set => ({
  // Inicializa desde localStorage → sin flash en recargas
  miniShopsEnabled: _initEnabled,
  platformName: _initEnabled ? 'MBDA Market' : 'MBDA Modas',
  storeInfoLoaded: false,
  menuConfig: {},
  menuConfigLoaded: false,

  setMiniShopsEnabled: (enabled: boolean) => {
    writeCached(enabled)
    set({
      miniShopsEnabled: enabled,
      platformName: enabled ? 'MBDA Market' : 'MBDA Modas',
      storeInfoLoaded: true,
    })
  },

  setMenuConfig: (config: MenuConfig) =>
    set({ menuConfig: config, menuConfigLoaded: true }),
}))
