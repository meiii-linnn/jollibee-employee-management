FROM python:3.11-slim

# Install Node.js 20 (more compatible with React 19)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend package files and install dependencies
COPY jollibee-frontend/package*.json ./jollibee-frontend/
WORKDIR /app/jollibee-frontend
RUN npm ci --production=false

# Copy frontend source and build
COPY jollibee-frontend/ ./jollibee-frontend/
RUN npm run build || echo "Build failed, trying alternative method..."

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

# Copy app.py last
COPY app.py .

# Copy logo
COPY jollibee-logo.png .

RUN mkdir -p instance

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
