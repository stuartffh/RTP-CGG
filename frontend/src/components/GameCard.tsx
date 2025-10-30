import React from 'react'
import type { Game } from '../types'

const IMAGE_ENDPOINT = '/imagens'

export function GameCard({ game, onOpen }: { game: Game; onOpen: (id: number) => void }) {
  const rtpDia = (game.rtp / 100).toFixed(2)
  const semana = game.rtp_semana != null ? (game.rtp_semana / 100).toFixed(2) : '--'
  const statusDia = game.rtp_status ?? (game.extra == null ? 'neutral' : (game.extra < 0 ? 'down' : 'up'))
  const statusSemana = game.status_semana ?? (game.extra_semana == null ? 'neutral' : (game.extra_semana < 0 ? 'down' : 'up'))
  const rtpStatus = statusDia || 'neutral'

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
              <strong className={statusDia === 'down' ? 'rtp-negative' : statusDia === 'up' ? 'rtp-positive' : undefined}>
                {rtpDia}%
              </strong>
              <div>{badge(statusDia, 'Dia')}</div>
            </div>
            <div>
              <strong className={statusSemana === 'down' ? 'rtp-negative' : statusSemana === 'up' ? 'rtp-positive' : undefined}>
                {semana}%
              </strong>
              <div>{badge(statusSemana, 'Semana')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

