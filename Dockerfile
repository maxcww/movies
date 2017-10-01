FROM node:latest

# Create the directory for the app
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY package.json /app/
RUN npm install
COPY . /app

# Non root user
RUN groupadd -r nodejs \
   && useradd -m -r -g nodejs nodejs
USER nodejs

EXPOSE 3000
CMD ["npm", "start"]