const { PubSub } = require('apollo-server');
const mqtt = require('mqtt')
const { MQTTPubSub } = require('@aerogear/graphql-mqtt-subscriptions')


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
    pubSub: new MQTTPubSub({ client })
}