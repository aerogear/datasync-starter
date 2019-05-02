const {
  execute,
  subscribe
} = require('graphql')
const { PubSub } = require('apollo-server');
const { SubscriptionServer } = require('subscriptions-transport-ws')
const mqtt = require('mqtt')
const { MQTTPubSub } = require('@aerogear/graphql-mqtt-subscriptions')

function subscriptionServer (keycloakService, httpServer, apolloServer) {
    return new SubscriptionServer({
      execute,
      subscribe,
      onConnect: async connectionParams => {
        if(keycloakService) {
          return await keycloakService.validateToken(connectionParams)
        } else {
          return true;
        }
      },
      schema: apolloServer.schema
    }, {
      server: httpServer,
      path: '/graphql'
    });
}


const host = process.env.MQTT_HOST || 'mqtt://localhost'

const mqttOptions = {
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '' ,
  port: process.env.MQTT_PORT || '1883',
  protocol: process.env.MQTT_PROTOCOL || 'mqtt'
}

const client = mqtt.connect(host, mqttOptions)

console.log(`attempting to connect to messaging service ${host}`)
console.log(mqttOptions)

client.on('connect', () => {
  console.log('connected to messaging service')
})

client.on('error', (error) => {
  console.log('error with mqtt connection')
  console.log(error)
})

module.exports = {
    subscriptionServer,
    pubSub: new MQTTPubSub({ client })
}