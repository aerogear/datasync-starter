import mqtt from 'mqtt'
import { PubSub } from 'apollo-server-express'
import { MQTTPubSub } from '@aerogear/graphql-mqtt-subscriptions'
import { config } from "./config/config"
import { KafkaPubSub } from 'graphql-kafka-subscriptions'

export function connectToPubSub() {
  if (config.kafka.enabled) {
    const pubsub = new KafkaPubSub({
      ...config.kafka
    });
    return pubsub;
  } else if (config.mqttConfig) {
    const mqttOptions = config.mqttConfig;
    // Types are broken
    const client = mqtt.connect(mqttOptions.mqttHost, mqttOptions as any)

    console.log(`attempting to connect to messaging service ${mqttOptions.mqttHost}`)

    client.on('connect', () => {
      console.log('connected to messaging service')
    })

    client.on('error', (error) => {
      console.log('error with mqtt connection')
      console.log(error)
    })

    return new MQTTPubSub({ client })
  }
  console.log('Using In Memory PubSub')
  return new PubSub()
}