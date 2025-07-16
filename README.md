# RTP-CGG

Aplicação Flask que consulta o endpoint `https://cbet.gg` e exibe em tempo real o RTP (Return to Player) dos jogos de cassino.

## Pré-requisitos

- **Python** 3.12 ou superior com `pip` instalado.
- **Docker** (opcional) para executar a aplicação em container.

## Como executar

### Utilizando Python

1. Crie um ambiente virtual e instale as dependências:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Inicie o servidor Flask:
   ```bash
   python app.py
   ```
   O serviço ficará disponível em `http://localhost:5000`.

### Utilizando Docker

1. Construa a imagem:
   ```bash
   docker build -t rtp-cgg .
   ```
2. Execute o container informando a porta desejada (padrão `5000`):
   ```bash
   docker run -e PORT=5000 -p 5000:5000 rtp-cgg
   ```
3. Acesse `http://localhost:5000` para visualizar o dashboard.

Esse mesmo Dockerfile funciona em plataformas como o **EasyPanel**, bastando informar a variável `PORT` caso a hospedagem utilize outra porta padrão.

## Scripts disponíveis

- `app.py` – servidor Flask principal.
- `Dockerfile` – script para criar a imagem Docker.
- `requirements.txt` – lista de dependências Python.

## Variáveis de ambiente

O projeto não exige variáveis de ambiente obrigatórias, mas algumas opções podem ser configuradas manualmente:

- `FLASK_APP` e `FLASK_ENV` podem ser usados ao executar via `flask run`.
- `PORT` pode definir a porta do servidor caso utilize o comando `flask run`.
- Defina `DEBUG_REQUESTS=true` para registrar detalhes das chamadas HTTP.
- A variável `FLASK_DEBUG` controla o modo debug do Flask.

Aplicação Flask que exibe os dados de RTP de jogos em tempo real.

### Buscar RTP por jogo

Utilize a rota `/api/search-rtp` para obter o RTP mais atual de cada jogo
informado na requisição:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"names":["Wisdom of Athena"]}' \
  http://localhost:5000/api/search-rtp
```

A resposta retornará o RTP mais recente de cada título enviado.

## Verificação SSL
Por padrão, as requisições HTTPS verificam o certificado do servidor. Para manter a segurança, **não desative** essa verificação em ambientes de produção.

Caso precise desabilitar temporariamente, defina a variável `VERIFY_SSL=false`
ou utilize a flag `--insecure`:

```bash
VERIFY_SSL=false python app.py
# ou
python app.py --insecure
```

Utilize essa opção apenas em cenários de desenvolvimento ou testes.


## Banco de dados SQLite

Para gerar relatórios de RTP é possível armazenar os valores em um banco SQLite.
Crie o arquivo `rtp.db` executando o script abaixo:

```bash
sqlite3 rtp.db <<SQL
CREATE TABLE IF NOT EXISTS rtp_history (
  game_id INTEGER,
  name TEXT,
  provider TEXT,
  rtp REAL,
  extra INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL
```

## Habilitar página de analytics

A página `/analytics` fica desabilitada por padrão. Defina a variável
`ENABLE_ANALYTICS=true` antes de iniciar o servidor para ativá-la:

```bash
ENABLE_ANALYTICS=true python app.py
```

### Consultar histórico

O endpoint `/api/history` retorna os registros gravados na tabela `rtp_history`.

Exemplos de uso:

```bash
# Últimos 50 registros
curl http://localhost:5000/api/history?limit=50

# Filtrar por jogo específico
curl http://localhost:5000/api/history?game_id=1024
```

## Documentação para contribuidores

As diretrizes de instalação e desenvolvimento estão em `AGENTS.md`. Já o arquivo `agents.md` concentra a descrição dos agentes e integrações. Consulte ambos ao fazer alterações.


