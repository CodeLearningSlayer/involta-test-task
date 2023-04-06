FROM node:14-alpine

WORKDIR /usr/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3010

CMD ["npm", "run", "dev"]