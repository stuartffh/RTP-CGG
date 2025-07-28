# Repository Guidelines

> **Escopo:** este documento descreve as regras de instalação, desenvolvimento e verificação do projeto. As informações sobre agentes e integrações estão em `agents.md`.

Consulte o arquivo `agents.md` para detalhes sobre os agentes da aplicação. Atualize este documento apenas com diretrizes de configuração e desenvolvimento do repositório.

## Setup
- Use **Python 3.12**.
- Install dependencies with `pip install -r requirements.txt` in a virtual environment.
- Start the development server using `python app.py`.
- Variables defined in a `.env` file are loaded automatically.

- **Analytics**: Registra o histórico de RTP em um banco PostgreSQL definido pela variável `DATABASE_URL`. O endereço padrão é `postgres://postgres:2412055aa@185.44.66.206:5432/vigilancia?sslmode=disable`. Os dados ficam na tabela `rtp_history` para exibição na página de analytics.
- Ao iniciar, este agente verifica se a coluna `rtp_status` existe e a cria automaticamente caso necessário.
- `REQUEST_TIMEOUT` define o timeout das requisições RTP.
- `WINNERS_TIMEOUT` controla o tempo limite do endpoint de vencedores.
- `RTP_UPDATE_INTERVAL` ajusta a pausa entre atualizações automáticas. Esse
  valor também define o intervalo padrão de envio de atualizações pelo
  websocket.


## Funções e Comportamentos

- `GET /api/games` – retorna jogos consultando `/live-rtp`.
- `GET /api/melhores` – prioriza jogos por desempenho.
- `POST /api/search-rtp` – pesquisa jogos enviando ao endpoint `/live-rtp/search` do site cgg.bet.br e, caso falhe, filtra a lista localmente. Utiliza headers `accept`, `content-type`, `x-language-iso`, `origin` e `referer`. A requisição respeita a variável `VERIFY_SSL` para definir se o certificado TLS será verificado.
- `GET /api/last-winners` – obtém os últimos vencedores do cassino.
- `GET /api/history` – recupera registros da tabela `rtp_history` no banco definido em `DATABASE_URL`.
- A tela de busca utiliza `/api/search-rtp` diretamente, atualizando os dados após a pesquisa e tentando novamente após alguns segundos quando necessário.
- Durante uma busca, os jogos exibidos também recebem atualizações em tempo real quando disponíveis pelo websocket.

- A interface possui filtros `min-extra` e `max-extra` para limitar a listagem pelos valores de `extra`.
- Os campos `alert-extra-pos` e `alert-extra-neg` tocam um som quando qualquer jogo ultrapassa os limites configurados.


- `GET /historico` – exibe gráfico e tabela de históricos gravados em banco local.
- `GET /api/history?period=` – retorna médias diárias, semanais ou mensais do RTP.


### Permissões

O agente de analytics precisa de permissão de leitura e escrita no banco configurado pela variável `DATABASE_URL`.
## Development
- Format Python code with `black` (line length 88).
- Keep JavaScript concise and avoid duplicates.
- Store user-facing strings in Portuguese.

## Verification
- Run `python -m py_compile app.py` to check syntax before committing.

