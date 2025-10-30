import React, { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Game } from './types'
import { fetchGames } from './api'
import { GameCard } from './components/GameCard'

export default function App() {
  const [games, setGames] = useState<Game[]>([])
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState('all')
  const [sort, setSort] = useState<'rtp' | 'name' | null>(null)

  useEffect(() => {
    let active = true
    fetchGames().then(d => active && setGames(d))
    const s: Socket = io('/', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket']
    })
    s.on('games_update', (d: Game[]) => setGames(d))
    return () => { active = false; s.disconnect() }
  }, [])

  const providers = useMemo(() => {
    const set = new Set<string>()
    games.forEach(g => g.provider?.name && set.add(g.provider.name))
    return ['all', ...Array.from(set).sort()]
  }, [games])

  const filtered = useMemo(() => {
    let list = [...games]
    if (query.trim()) list = list.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    if (provider !== 'all') list = list.filter(g => g.provider?.name === provider)
    if (sort === 'rtp') list.sort((a,b) => b.rtp - a.rtp)
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name))
    return list
  }, [games, query, provider, sort])

  const statusCounts = useMemo(() => {
    let up = 0, down = 0, neutral = 0
    for (const g of filtered) {
      const st = g.rtp_status ?? (g.extra == null ? 'neutral' : (g.extra < 0 ? 'down' : 'up'))
      if (st === 'up') up++
      else if (st === 'down') down++
      else neutral++
    }
    return { up, down, neutral, total: filtered.length }
  }, [filtered])

  return (
    <div style={{ padding: 16 }}>
      <div className="sw-toolbar">
        <h1 className="sw-title" style={{ margin: 0 }}>RTP em Tempo Real</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sw-btn" onClick={() => setSort('rtp')}>Ordenar RTP</button>
          <button className="sw-btn" onClick={() => setSort('name')}>Ordenar Nome</button>
        </div>
      </div>

      <div className="sw-panel" style={{ padding: 12, marginBottom: 16, display: 'grid', gap: 8, gridTemplateColumns: '1fr 240px' }}>
        <input
          placeholder="Pesquisar por nome"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="form-control"
          style={{ height: 36, background: '#0f1424', color: '#e6e6e6', border: '1px solid rgba(255,255,255,.06)' }}
        />
        <select value={provider} onChange={e => setProvider(e.target.value)} className="form-select" style={{ height: 36, background: '#0f1424', color: '#e6e6e6', border: '1px solid rgba(255,255,255,.06)' }}>
          {providers.map(p => <option key={p} value={p}>{p === 'all' ? 'Todos os provedores' : p}</option>)}
        </select>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, fontSize: '.9rem', opacity: .9 }}>
          <span>Total: {statusCounts.total}</span>
          <span className="rtp-positive">Positivos: {statusCounts.up}</span>
          <span className="rtp-negative">Negativos: {statusCounts.down}</span>
          <span>Neutros: {statusCounts.neutral}</span>
        </div>
      </div>

      <div className="sw-grid">
        {filtered.map(g => (
          <GameCard key={g.id} game={g} onOpen={() => { /* modal futuro */ }} />
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <a href="/" style={{ marginRight: 12 }}>Interface Clássica</a>
        <a href="/historico" style={{ marginRight: 12 }}>Histórico</a>
        <a href="/historico-registros" style={{ marginRight: 12 }}>Registros</a>
        <a href="/melhores">Melhores</a>
      </div>
    </div>
  )
}

