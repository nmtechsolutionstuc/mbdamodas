import { create } from 'zustand'

interface PlatformState {
  miniShopsEnabled: boolean
  platformName: string
  setMiniShopsEnabled: (enabled: boolean) => void
}

export const usePlatformStore = create<PlatformState>()(set => ({
  miniShopsEnabled: true,
  platformName: 'MBDA Market',
  setMiniShopsEnabled: (enabled: boolean) => set({
    miniShopsEnabled: enabled,
    platformName: enabled ? 'MBDA Market' : 'MBDA Modas',
  }),
}))
