const { pubSub } = require('../subscriptions')
const { conflictHandler } = require("@aerogear/voyager-conflicts")
const { TASK_ADDED, TASK_DELETED, TASK_UPDATED } = require("./subscriptions")
const { ObjectID } = require("mongodb");

const typeDefs = `
type Task {
  id: ID!
  version: Int
  title: String!
  description: String!
  status: TaskStatus
}

enum TaskStatus {
  OPEN
  ASSIGNED
  COMPLETE
}

type Query {
  allTasks(first: Int, after: String): [Task],
  getTask(id: ID!): Task
}

type Mutation {
  createTask(title: String!, description: String!, status: TaskStatus): Task
  updateTask(id: ID!, title: String, description: String, version: Int!, status: TaskStatus): Task
  deleteTask(id: ID!): ID
}
`

const PUSH_ALIAS = 'cordova';

const taskResolvers = {
  Query: {
    allTasks: async (obj, args, context) => {
      if (args.startedAt) {
        return [{
          "id": "5e29872a529accf649bf6951",
          "version": 1,
          "title": "Task1",
          "description": "test",
          "status": "OPEN",
          '__deleted': false,
        },
        {
          "id": "5e29872a529accf649bf6951",
          "version": 1,
          "title": "Task1",
          "description": "test",
          "status": "OPEN",
          '__deleted': true,
        }]
      }
      const result = await context.db.collection('tasks').find({}).limit(args.limit || 50).toArray()
      const idresult = result.map(item => Object.assign({ id: item._id }, item));
      console.log(idresult);
      return idresult
    },
    getTask: async (obj, args, context, info) => {
      // TODO
      return {}
    }
  },

  Mutation: {
    createTask: async (obj, args, context, info) => {
      const result = await context.db.collection('tasks').insertOne({
        ...args,
        version: 1,
        status: 'OPEN'
      })
      console.log(result);
      const item = await context.db.collection('tasks').findOne({ _id: ObjectID(result.insertedId) })
      item.id = item._id;
      console.log("TASK CREATED", item)
      publish(TASK_ADDED, item, context.pushClient, context.db)
      return item
    },
    updateTask: async (obj, clientData, context, info) => {
      // TODO
      console.log("Update", clientData)
      const task = await context.db.collection('tasks').
        findOneAndUpdate({ _id: ObjectID(clientData.id) }, { $set: clientData })
      if (!task) {
        throw new Error(`Invalid ID for task object: ${clientData.id}`);
      }


      publish(TASK_UPDATED, task.value, undefined, context.db)
      console.log("Update made", task.value)
      return task.value;
    },
    deleteTask: async (obj, args, context, info) => {
      console.log("Delete", args)
      const result = await context.db.collection('tasks').findOneAndDelete({ _id: ObjectID(args.id) })
      console.log(result);
      if (!result.value) {
        throw new Error("not deleted", result);
      }
      const deletedId = result.value._id
      console.log(result.value);
      publish(TASK_DELETED, result.value, undefined, context.db)
      return deletedId;

    }
  }
}

function publish(actionType, data, pushClient, db) {
  // Save data to diff table
  // TODO timestamp is not enough to determine as there could be two writes happening in the same millisecond. 
  // We need to probably use ID+timestamp
  db.collection("tasks_delta").insertOne({ ...data, _id: undefined, timestamp: new Date().getTime(), deleted: actionType === TASK_DELETED })

  if (pushClient) {
    pushClient.sender.send({
      alert: `New task: ${data.title}`,
      userData: {
        title: data.title,
        message: actionType
      }
    },
      {
        criteria: {
          alias: [PUSH_ALIAS]
        }
      }).then((response) => {
        console.log("Notification sent, response received ", response);
      }).catch((error) => {
        console.log("Notification not sent, error received ", error)
      })
  }
  switch (actionType) {
    case (TASK_ADDED):
      pubSub.publish(actionType, { taskAdded: data });
      break;
    case (TASK_DELETED):
      pubSub.publish(actionType, { taskDeleted: data });
      break;
    case (TASK_UPDATED):
      pubSub.publish(actionType, { taskUpdated: data });
      break;
  }
}

module.exports = {
  taskResolvers: taskResolvers,
  taskTypeDefs: typeDefs
}