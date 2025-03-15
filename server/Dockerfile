# Use lightweight Python image
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose Flask port
EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]