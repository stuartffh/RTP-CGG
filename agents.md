## Lista de Agentes

Para instruções de configuração e diretrizes de contribuição, consulte o arquivo `AGENTS.md`.

- **RTP-CGG**: Servidor Flask que exibe o RTP dos jogos em tempo real.
- **Analytics**: Registra o histórico de RTP no banco SQLite `rtp.db`, na tabela `rtp_history`, para exibição na página de analytics.

## Funções e Comportamentos

- `GET /api/games` – retorna jogos consultando `/live-rtp`.
- `GET /api/melhores` – prioriza jogos por desempenho.
- `POST /api/search-rtp` – pesquisa jogos enviando ao endpoint `/live-rtp/search` do site cbet.gg e, caso falhe, filtra a lista localmente. Utiliza headers `accept`, `content-type`, `x-language-iso`, `origin` e `referer`. A requisição respeita a variável `VERIFY_SSL` para definir se o certificado TLS será verificado.
- `GET /api/last-winners` – obtém os últimos vencedores do cassino.
- `GET /api/history` – recupera registros da tabela `rtp_history` em `rtp.db`.
- A tela de busca utiliza `/api/search-rtp` diretamente, atualizando os dados após a pesquisa e tentando novamente após alguns segundos quando necessário.

- A interface possui filtros `min-extra` e `max-extra` para limitar a listagem pelos valores de `extra`.
- Os campos `alert-extra-pos` e `alert-extra-neg` tocam um som quando qualquer jogo ultrapassa os limites configurados.


- `GET /historico` – exibe gráfico e tabela de históricos gravados em banco local.
- `GET /api/history?period=` – retorna médias diárias, semanais ou mensais do RTP.


### Permissões

O agente de analytics precisa de permissão de leitura e escrita no arquivo `rtp.db`.


