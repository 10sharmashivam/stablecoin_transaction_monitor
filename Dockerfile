FROM python:3.8-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=run.py
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]