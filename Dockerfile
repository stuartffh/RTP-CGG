# Usa uma imagem oficial Python slim
FROM python:3.12-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y build-essential

# Cria diretório da aplicação
WORKDIR /app

# Copia os arquivos de dependências
COPY requirements.txt .

# Instala dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código-fonte da aplicação
COPY . .

# Define a porta da aplicação Flask
EXPOSE 5000

# Executa a aplicação Flask
CMD ["python", "app.py"]
