FROM node:14.18

WORKDIR /usr/app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "test" ]