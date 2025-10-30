import type { Game } from './types'

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch('/api/games')
  if (!res.ok) return []
  return res.json()
}

export async function fetchMelhores(): Promise<Game[]> {
  const res = await fetch('/api/melhores')
  if (!res.ok) return []
  return res.json()
}

export async function searchRtp(names: string[]): Promise<Game[]> {
  const res = await fetch('/api/search-rtp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  })
  if (!res.ok) return []
  return res.json()
}

