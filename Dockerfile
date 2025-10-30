FROM node:20-bullseye AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* frontend/pnpm-lock.yaml* frontend/yarn.lock* ./
RUN npm ci || npm install
COPY frontend .
RUN npm run build

FROM python:3.12-slim AS backend

ENV PYTHONUNBUFFERED=1
ENV PORT=5000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Copia o build do React para static/react, servido pelo Flask em /app
COPY --from=frontend /app/static/react /app/static/react
EXPOSE 5000

CMD ["gunicorn", "-k", "eventlet", "-b", "0.0.0.0:5000", "wsgi:app"]