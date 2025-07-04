# RTP-CGG

Aplicação Flask que consulta o endpoint `https://cgg.bet.br` e exibe em tempo real o RTP (Return to Player) dos jogos de cassino.

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
- A constante `DEBUG_REQUESTS` em `app.py` habilita logs detalhados (por padrão vem ativada).
- `OPENAI_API_KEY` chave de acesso à API da OpenAI para geração de recomendações.


Aplicação Flask que exibe os dados de RTP de jogos em tempo real.

## Recomendações com OpenAI

Defina a variável `OPENAI_API_KEY` com a sua chave da OpenAI para habilitar o endpoint `/api/recommendations`.
No painel, clique em **Gerar Recomendações** para obter sugestões de jogos com maior potencial de pagamento.

## Verificação SSL
Por padrão, as requisições HTTPS verificam o certificado do servidor. Para manter a segurança, **não desative** essa verificação em ambientes de produção.

Se for necessário desabilitar temporariamente:

```bash
VERIFY_SSL=false python app.py
# ou
python app.py --insecure
```

Utilize essa opção apenas em cenários de desenvolvimento ou testes.

