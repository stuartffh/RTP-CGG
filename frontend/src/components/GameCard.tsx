import React from 'react'
import type { Game } from '../types'

const IMAGE_ENDPOINT = '/imagens'

export function GameCard({ game, onOpen }: { game: Game; onOpen: (id: number) => void }) {
  const rtpDia = (game.rtp / 100).toFixed(2)
  const semana = game.rtp_semana != null ? (game.rtp_semana / 100).toFixed(2) : '--'
  const rtpStatus = game.rtp_status || 'neutral'

  const badge = (status?: string, label = '') => {
    const cls = status === 'up' ? 'bg-success' : status === 'down' ? 'bg-danger' : 'bg-secondary'
    return <span className={`badge ${cls} rtp-badge`}>{label}</span>
  }

  return (
    <div className="game-card" data-status={rtpStatus} data-id={game.id}>
      <div className="card bg-dark text-white h-100">
        <img
          className="card-img-top game-img img-fluid"
          alt={`Imagem de ${game.name}`}
          src={`${IMAGE_ENDPOINT}/${game.id}.webp`}
          onClick={() => onOpen(game.id)}
        />
        <div className="card-body text-center">
          <h5 className="card-title" title="Clique para copiar" onClick={() => navigator.clipboard.writeText(game.name)}>
            {game.name}
          </h5>
          <p className="card-text mb-1">Provedor: {game.provider?.name}</p>
          {typeof game.extra === 'number' && <p className="mb-1 unidades">Unidades: {game.extra}</p>}
          <div className="rtp-container">
            <div>
              <strong>{rtpDia}%</strong>
              <div>{badge(game.rtp_status, 'Dia')}</div>
            </div>
            <div>
              <strong>{semana}%</strong>
              <div>{badge(game.status_semana, 'Semana')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

