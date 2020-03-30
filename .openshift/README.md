## OpenShift templates

### DataSync Starter App template

Name: `datasync-app-template.yml`

This template starts datasync container on top of the mongodb instances:

#### Prerequisites

1. Running MongoDB instance 
2. Connection details to MongoDB server

#### Steps

1. Add template to your openshift 
2. Provide MongoDB connection details
3. Wait for the pods to start

# Deploying the Showcase Server with AMQ

Prerequisites

* AMQ Online is installed in the cluster

This section describes how to deploy the showcase in an OpenShift cluster from the supplied `amq.yml` template file.
* Add template to your openshift instance: `oc create -f amq.yml`
* The form is already prefilled with all of the necessary values.
* The only field you might want to change is `AMQ Messaging User Password`.
  * The default value is `Password1` in base64 encoding
  * The value *must* be base64 encoded
  * A custom value can be created in the terminal using `$ echo <password> | base64` 
* When the create button is clicked, a warning message may be displayed

> This will create resources that may have security or project behavior implications. Make sure you understand what they do before creating them. The resources being created are: address space, address, messaging user

The hostname for the AMQ Online Broker is only made available after the resources from the the template have been provisioned. One more step is needed to supply `MQTT_HOST` environment variable to running server.

* From the terminal, ensure you have the correct namespace selected.

```
oc project <project where template was provisioned>
```

* Update the ionic-showcase-server deployment to add the `MQTT_HOST` variable. 

```
oc set env dc/ionic-showcase-server MQTT_HOST="$(oc get addressspace showcase -o jsonpath='{.status.endpointStatuses[?(@.name=="messaging")].serviceHost}')"
```

At this point, the showcase server is provisioned and the logs from the ionic-showcase-server pod will include the output `connected to messaging service`.