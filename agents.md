## Lista de Agentes

- **RTP-CGG**: Servidor Flask que exibe o RTP dos jogos em tempo real.

## Funções e Comportamentos

- `GET /api/games` – retorna jogos consultando `/live-rtp`.
- `GET /api/melhores` – prioriza jogos por desempenho.
- `POST /api/search-rtp` – pesquisa jogos enviando ao endpoint `/live-rtp/search` do site cbet.gg. Utiliza headers `accept`, `content-type`, `x-language-iso`, `origin` e `referer`. A requisição respeita a variável `VERIFY_SSL` para definir se o certificado TLS será verificado.
- `GET /api/last-winners` – obtém os últimos vencedores do cassino.
