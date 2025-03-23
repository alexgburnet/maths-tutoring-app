# Use lightweight Python image
FROM python:3.11-slim

WORKDIR /app

# Install OS dependencies for psycopg2, LaTeX, and build tools
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    fonts-lmodern \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose Flask port
EXPOSE 5000

# Run migrations & startup script, then launch app
CMD ["sh", "-c", "flask db upgrade && python startup.py && flask run --host=0.0.0.0"]