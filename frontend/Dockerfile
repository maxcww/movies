FROM node:latest

# Create the directory for the app
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY package.json /app/
RUN npm install --silent
COPY . /app

EXPOSE 3000
CMD ["npm", "RUN"]