const STORAGE_KEY = 'sentinelai_history'

export function readHistory() {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveScanResult(entry) {
  const nextHistory = [entry, ...readHistory()].slice(0, 20)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
  }
  return nextHistory
}

export function deleteScanResult(id) {
  const nextHistory = readHistory().filter((entry) => entry.id !== id)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
  }
  return nextHistory
}
