FROM node:latest

# Create the directory for the app
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY package.json /app/
RUN npm install
COPY . /app

# Non root user
RUN groupadd -r react \
   && useradd -m -r -g react react
USER react

EXPOSE 3000
CMD ["npm", "start"]