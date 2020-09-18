# TODO maybe use multi-stage build to remove extra dev dependencies? 
FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app
COPY . .

RUN npm install

VOLUME ./files

EXPOSE 4000
CMD [ "npm", "start" ]
