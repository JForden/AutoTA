# Pull node base image
FROM node:14

ENV CHOKIDAR_USEPOLLING true

# set working directory
WORKDIR /app

# Install depenencies
COPY package.json .
COPY yarn.lock .
RUN yarn --silent
RUN yarn global add react-scripts --silent

# Add app
COPY . ./

EXPOSE 3000

# Start yarn dev server
CMD ["yarn", "start"]