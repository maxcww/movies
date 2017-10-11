FROM node:latest

# Create the directory for the app
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY package.json /app/
RUN npm install
COPY . /app

EXPOSE 8080
CMD ["npm", "start"]