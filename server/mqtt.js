const mqtt = require('mqtt')

const host = process.env.MQTT_HOST || 'broker-amq-mqtt-showcase-with-amq.apps.pahayes-5b54.openshiftworkshop.com'

const mqttOptions = {
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '' ,
  port: process.env.MQTT_PORT || '80',
  protocol: process.env.MQTT_PROTOCOL || 'tcp'
}

// const mqttOptions = {
//     port,
//     protocol,
//     connectTimeout: 5000
//   }

  console.log('attempting to connect to messaging service ' + host)
  console.log(mqttOptions)
  
  const client = mqtt.connect(host, mqttOptions)

client.on('connect', function () {
    console.log('connected')
    client.subscribe('presence', function (err) {
      if (!err) {
        client.publish('presence', 'Hello mqtt')
      }
    })
  })
   
  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
  })

  client.on('error', (error) => {
    console.log('error with mqtt connection')
    console.log(error)
  })