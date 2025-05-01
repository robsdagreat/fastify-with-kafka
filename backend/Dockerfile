FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy app files (optional for dev, since we mount ./src)
COPY . .

CMD ["npm", "run", "dev"]