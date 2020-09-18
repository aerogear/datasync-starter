FROM node:10

# Create app directory
WORKDIR /usr/src/app

RUN npm install
COPY . .

VOLUME ./files

EXPOSE 4000
CMD [ "npm", "start" ]
