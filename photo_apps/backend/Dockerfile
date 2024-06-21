FROM python:3.8-slim

WORKDIR /app

# Встановлення системних залежностей
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    build-essential \
    cmake \
    libgtk2.0-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Встановлення Python-залежностей
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Копіювання решти додатків
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
