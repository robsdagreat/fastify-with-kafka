FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN echo "NEXT_PUBLIC_BUILD_TIME=true" >> .env
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]