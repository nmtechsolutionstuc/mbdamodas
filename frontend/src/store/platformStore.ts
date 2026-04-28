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
  miniShopsEnabled: true,
  platformName: 'MBDA Market',
  storeInfoLoaded: false,
  menuConfig: {},
  menuConfigLoaded: false,

  setMiniShopsEnabled: (enabled: boolean) =>
    set({
      miniShopsEnabled: enabled,
      platformName: enabled ? 'MBDA Market' : 'MBDA Modas',
      storeInfoLoaded: true,
    }),

  setMenuConfig: (config: MenuConfig) =>
    set({ menuConfig: config, menuConfigLoaded: true }),
}))
