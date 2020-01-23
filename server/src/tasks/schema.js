const { pubSub } = require('../subscriptions')
const { TASK_ADDED, TASK_DELETED, TASK_UPDATED } = require("./subscriptions")
const { ObjectID } = require("mongodb");

const typeDefs = `

type Task {
  id: ID!
  title: String!
  description: String!
  status: TaskStatus
  version: Int
  _deleted: Boolean
  _lastModified: String!
}

interface Connection {
  startedAt: String!
}

type TaskConnection implements Connection {
  items: [Task!]!
  startedAt: String!
}

enum TaskStatus {
  OPEN
  ASSIGNED
  COMPLETE
}

type Query {
  getTask(id: ID!): Task
  allTasks(lastSync: String): TaskConnection!,
}

type Mutation {
  createTask(title: String!, description: String!, status: TaskStatus): Task
  updateTask(id: ID!, title: String, description: String, version: Int!, status: TaskStatus): Task
  deleteTask(id: ID!): ID
}
`

const PUSH_ALIAS = 'cordova';

function Connection(items, timestamp) {
  return {
    items,
    startedAt: timestamp
  }
}

const taskResolvers = {
  Query: {
    allTasks: async (obj, args, context) => {
      if (args.lastSync) {
        const results = await getResultsFromDiffTable('task', args.limit, args.lastSync, context.db)
        console.log(results);
        // TODO eventual inconsistency - result need to be ordered
        return Connection(results, new Date().getTime())
      }
      const result = await context.db.collection('tasks').find({}).limit(args.limit || 50).toArray()
      const idresult = result.map(item => Object.assign({ id: item._id.toString() }, item));
      console.log(idresult);
      // TODO eventual inconsistency - result need to be ordered
      return Connection(idresult, new Date().getTime())
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
        // This is optional but we keep it there for testing
        _deleted: false,
        _lastModified: new Date().getTime(),
        status: 'OPEN'
      })
      const item = await context.db.collection('tasks').findOne({ _id: ObjectID(result.insertedId) })
      item.id = item._id;
      console.log("TASK CREATED", item)
      publishAndSaveDiff(TASK_ADDED, item, context.pushClient, context.db)
      return item
    },
    updateTask: async (obj, clientData, context, info) => {
      console.log("Update", clientData)
      const task = await context.db.collection('tasks').
        findOneAndUpdate({ _id: ObjectID(clientData.id) }, { $set: clientData, $currentDate: { "_lastModified": true } })
      if (!task.value) {
        throw new Error(`Invalid ID for task object: ${clientData.id}`);
      }
      task.value.id = clientData.id
      publishAndSaveDiff(TASK_UPDATED, task.value, undefined, context.db)
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
      publishAndSaveDiff(TASK_DELETED, result.value, undefined, context.db)
      return deletedId;

    }
  }
}

function publishAndSaveDiff(actionType, data, pushClient, db) {
  createDiffEntry('task', data, actionType, db);

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

// 2 Days
const defaultTTL = 2 * 24 * 60 * 60 * 1000;

/**
 * MAIN method for delta processing that creates table per entry name
 * 
 * @param {*} entryName name of the entity that is being processed
 * @param {*} data - actual data that was modified
 * @param {*} actionType - type of action 
 * @param {*} db - mongo driver
 */
function createDiffEntry(entryName, data, actionType, db) {
  const timestamp = new Date().getTime(); // For more precision use Number(process.hrtime().join(''));
  const actionMetadata = {
    _ttl: timestamp + defaultTTL,
    // Key used to sort operations that happened used to fetch all entries
    _sortKey: timestamp,
    // Marker if field was deleted (we need it for soft delete feature to evit client data)
    _deleted: actionType === TASK_DELETED
  };

  // Save data to diff table

  // TODO for production usage we need to create indexes
  // FIXME filtering to save only deleted operation can be applied. 
  // This means that original table can be always query and we can query delta only for deletes that happend for some timestamp 
  // This can be done only when it is possible to change order key in original table

  db.collection(`${entryName}_delta`).insertOne({ ...data, _id: undefined, ...actionMetadata });
}

/**
 * @param {*} entryName name of the entity that is being processed
 * @param {*} db - mongo driver
 * @param {*} entryName 
 * @param {*} limit data limit
 * @param {*} lastSync sort key for fetching data
 */
function getResultsFromDiffTable(entryName, limit, lastSync, db) {
  if (!limit) limit = 100; 
  console.log("Using lastsync data", lastSync, limit);
  return db.collection(`${entryName}_delta`).find({ _sortKey: { $gt: Number(lastSync) } }).toArray();
}