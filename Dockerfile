FROM python:3.11-slim

LABEL maintainer="Team BISHOP <bishop.sih2026@astra.local>"
LABEL description="ASTRA: Darknet Threat Actor De-Anonymization Forensic Tool (SIH 2026)"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ASTRA_DATA_DIR=/app/data \
    ASTRA_REPORTS_DIR=/app/reports

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tor \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source files
COPY . .
RUN pip install --no-cache-dir -e .

# Create persistent forensic storage directories
RUN mkdir -p /app/data /app/reports

ENTRYPOINT ["astra"]
CMD ["--help"]
