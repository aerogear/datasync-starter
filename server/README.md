# DataSync Full Stack Server

Node.js template using Graphback

## Integrations

- Graphback (Apollo GraphQL template)
- Keycloak (Authentication)
- AMQ Online (MQTT)
- MongoDB

## Usage

This project has been created using Graphback. 
Run the project using the following steps:

- Install

```sh
yarn install
```

- Start the Mongo database and MQTT client

```sh
docker-compose up -d
```

- Generate resources(schema and resolvers) and create database

```sh
yarn graphback generate
```

- Start the server

```sh
yarn start:server
```

### Running kafka

1. `yarn kafka`
2. `KAFKA_HOST=127.0.0.1 yarn start`

##### Flags for problems with building kafka client for MacOS

export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib