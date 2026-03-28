import { useState, useEffect } from 'react'
import type { ProductType } from '../types'
import { fetchPublicProductTypes } from '../api/items'

let cachedProductTypes: ProductType[] | null = null

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductType[]>(cachedProductTypes ?? [])
  const [loading, setLoading] = useState(!cachedProductTypes)

  useEffect(() => {
    if (cachedProductTypes) return
    fetchPublicProductTypes()
      .then(data => {
        cachedProductTypes = data
        setProductTypes(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { productTypes, loading }
}
