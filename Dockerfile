FROM python:3.11-slim

# Install Node.js for building React frontend
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and build frontend
COPY jollibee-frontend ./jollibee-frontend
WORKDIR /app/jollibee-frontend
RUN npm install && npm run build

WORKDIR /app

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

# Copy app.py last to avoid cache issues
COPY app.py .

# Copy logo
COPY jollibee-logo.png .

RUN mkdir -p instance

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
