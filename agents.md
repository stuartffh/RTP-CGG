# Repository Guidelines

> **Escopo:** este documento descreve as regras de instalação, desenvolvimento e verificação do projeto. As informações sobre agentes e integrações estão em `agents.md`.

Consulte o arquivo `agents.md` para detalhes sobre os agentes da aplicação. Atualize este documento apenas com diretrizes de configuração e desenvolvimento do repositório.

## Setup
- Use **Python 3.12**.
- Install dependencies with `pip install -r requirements.txt` in a virtual environment.
- Start the development server using `python app.py`.

## Development
- Format Python code with `black` (line length 88).
- Keep JavaScript concise and avoid duplicates.
- Store user-facing strings in Portuguese.

## Verification
- Run `python -m py_compile app.py` to check syntax before committing.

