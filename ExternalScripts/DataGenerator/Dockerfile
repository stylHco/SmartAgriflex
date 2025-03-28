# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install necessary system dependencies, including gnupg to handle keys
RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    gcc \
    g++ \
    curl \
    gnupg \
    apt-transport-https \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy current directory contents into the container
COPY . /app

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables for Python
ENV PYTHONUNBUFFERED 1

# Run the script when the container starts
CMD ["python", "InjestLiveDataForDigitalSensorsThroughCustomAPI.py"]