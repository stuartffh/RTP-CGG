## Lista de Agentes

- **RTP-CGG**: Servidor Flask que exibe o RTP dos jogos em tempo real.

## Funções e Comportamentos

- `GET /api/games` – retorna jogos consultando `/live-rtp`.
- `GET /api/melhores` – prioriza jogos por desempenho.
- `POST /api/search-rtp` – pesquisa jogos enviando ao endpoint `/live-rtp/search` do site cbet.gg e, caso falhe, filtra a lista localmente. Utiliza headers `accept`, `content-type`, `x-language-iso`, `origin` e `referer`. A requisição respeita a variável `VERIFY_SSL` para definir se o certificado TLS será verificado.
- `GET /api/last-winners` – obtém os últimos vencedores do cassino.
- A tela de busca utiliza `/api/search-rtp` diretamente e atualiza os dados a cada segundo enquanto houver termo ativo ou um jogo estiver aberto.
