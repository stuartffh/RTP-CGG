FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV PORT=5000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
MKDIR image_cache

EXPOSE 5000

CMD ["gunicorn", "-k", "eventlet", "-b", "0.0.0.0:5000", "wsgi:app"]
