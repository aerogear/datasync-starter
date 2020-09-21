# Create the app building stage where compilation occures

FROM node:14-alpine as builder

WORKDIR /usr/src/app
COPY . .

RUN npm install && npm run build

RUN cp src/config/playground.gql dist/config && cp src/config/_keycloak.json dist/config

# Create a production ready app with only prod dependencies and compiled src
FROM node:14-alpine

WORKDIR /usr/src

ENV NODE_ENV=production

COPY model model 
COPY package.json . 
COPY --from=builder /usr/src/app/dist app

RUN npm install --production

VOLUME ./files

EXPOSE 4000
CMD [ "node", "app/index.js" ]
