FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

WORKDIR /app/grow4me_budget_app

RUN python manage.py collectstatic --noinput

EXPOSE 8080

CMD exec gunicorn --bind 0:$PORT --workers 2 --threads 4 grow4me_budget_app.wsgi:application
