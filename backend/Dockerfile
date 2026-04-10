FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8080

# Cloud Run injects the PORT env variable; gunicorn binds to it
CMD exec gunicorn --bind 0:$PORT --workers 2 --threads 4 grow4me.wsgi:application
