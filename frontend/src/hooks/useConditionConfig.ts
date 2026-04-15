import { useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient'
import type { ItemCondition } from '../types'
import { CONDITION_LABELS } from '../types'

export interface ConditionEntry {
  label: string
  active: boolean
  order: number
}

export type ConditionConfig = Partial<Record<ItemCondition, ConditionEntry>>

export const ALL_CONDITIONS: ItemCondition[] = [
  'NUEVA_CON_ETIQUETA',
  'NUEVA_SIN_ETIQUETA',
  'COMO_NUEVA',
  'BUEN_ESTADO',
  'USO_MODERADO',
  'USO_INTENSO',
]

// Module-level cache so we only fetch once per session
let _cache: ConditionConfig | null = null
let _promise: Promise<ConditionConfig> | null = null

async function loadConditionConfig(): Promise<ConditionConfig> {
  if (_cache !== null) return _cache
  if (_promise) return _promise
  _promise = axiosClient
    .get('/store-info')
    .then(r => {
      _cache = (r.data?.data?.store?.conditionConfig as ConditionConfig) ?? {}
      return _cache
    })
    .catch(() => {
      _cache = {}
      return {} as ConditionConfig
    })
  return _promise
}

export function invalidateConditionCache() {
  _cache = null
  _promise = null
}

export function useConditionConfig() {
  const [config, setConfig] = useState<ConditionConfig>(_cache ?? {})

  useEffect(() => {
    loadConditionConfig().then(setConfig)
  }, [])

  /** Etiqueta visible para una condición (custom o default) */
  function getLabel(condition: ItemCondition): string {
    return config[condition]?.label ?? CONDITION_LABELS[condition] ?? condition
  }

  /** Lista de condiciones activas, ordenadas por el campo order */
  function getActiveConditions(): ItemCondition[] {
    return ALL_CONDITIONS.filter(c => {
      const entry = config[c]
      return entry === undefined || entry.active !== false
    }).sort((a, b) => {
      const oA = config[a]?.order ?? ALL_CONDITIONS.indexOf(a)
      const oB = config[b]?.order ?? ALL_CONDITIONS.indexOf(b)
      return oA - oB
    })
  }

  return { config, getLabel, getActiveConditions }
}
