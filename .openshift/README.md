## OpenShift templates

### DataSync Starter App template

Name: `datasync-app-template.yml`

This template starts datasync container on top of the mongodb instances:

#### Steps

1. Create a new project
2. Add template to your openshift 

> NOTE: All the commands needs to be run on the project root.
> All make sure that you've logged in to your OpenShift cluster.

# Create a new Project

To create a new project in OpenShift run the following command:

```bash
yarn openshift:init my-new-project
```

# Deploying Server

Execute template on your openshift instance by: 

```bash
yarn openshift:deploy 
```

You should see the following messages if all went well.

```log
configmap/datasync-model created
secret/mongodb-credentials created
deploymentconfig.apps.openshift.io/datasync-starter-server created
service/datasync-starter-server created
service/mongodb created
deploymentconfig.apps.openshift.io/mongodb created
persistentvolumeclaim/mongodb created
route.route.openshift.io/datasync-starter-server created
deploymentconfig.apps.openshift.io/mosquitto-mqtt-broker created
service/mosquitto-mqtt-broker created
```
