FROM node:20.11.1

# Set the NODE_OPTIONS environment variable to enable legacy OpenSSL support
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set environment variable to handle file system polling
ENV CHOKIDAR_USEPOLLING=true

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock first (to leverage Docker's caching mechanism)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["yarn", "start"]
