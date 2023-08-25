FROM python:3.10-slim-bullseye

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=America/Chicago

# Copy the requirements file into the image
COPY ./requirements.txt /app/requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    clang

# Install Clang tools via pip
RUN pip install clang-tools
RUN clang-tools --install 13

# Install Python dependencies
RUN pip install -r requirements.txt \
    requests \
    pylint \
    openai \
    aiopyston

# Copy the entire content from the local directory to the image
COPY . /app

# Set Flask environment variables
ENV FLASK_APP=app.py
ENV FLASK_DEBUG=1

# Expose port 5000
EXPOSE 5000

# Start the Flask server
CMD ["flask", "run", "-h", "0.0.0.0"]
