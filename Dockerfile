FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy pre-built frontend
COPY jollibee-frontend/dist ./jollibee-frontend/dist

# Copy backend files
COPY models.py .
COPY seed.py .

# Copy all route modules
COPY employee/ ./employee/
COPY attendance/ ./attendance/
COPY contract/ ./contract/
COPY insurance/ ./insurance/
COPY salary/ ./salary/
COPY schedule/ ./schedule/

# Copy app.py
COPY app.py .

# Copy logo
COPY jollibee-logo.png .

RUN mkdir -p instance

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
