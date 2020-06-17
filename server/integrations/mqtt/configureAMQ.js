const execSync = require("child_process").execSync;

const AMQURL = execSync(
  `oc get addressspace datasync -o jsonpath='{.status.endpointStatuses[?(@.name=="messaging")].externalHost}'`,
  { encoding: "utf8" }
);


const message = `
Obtained your credentials from the AMQ server. 
Please update your .env file with following config:

MQTT_HOST = ${AMQURL}
MQTT_PORT = 443
MQTT_PASSWORD = Password1
MQTT_USERNAME = messaging-user
MQTT_PROTOCOL = tls
`
console.log(message);