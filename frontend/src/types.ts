export type Provider = { name: string; slug?: string }

export type Game = {
  id: number
  name: string
  provider: Provider
  image?: string
  rtp: number
  extra?: number | null
  rtp_status?: 'up' | 'down' | 'neutral'
  rtp_semana?: number | null
  extra_semana?: number | null
  status_semana?: 'up' | 'down' | 'neutral'
  prioridade?: string
}

