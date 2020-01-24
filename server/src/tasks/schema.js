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
  ## Metadata fields
  deleted: Boolean
  lastModified: String!
}

interface Connection {
  lastSync: String!
}

type TaskConnection implements Connection {
  items: [Task!]!
  lastSync: String!
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
    lastSync: timestamp
  }
}

const taskResolvers = {
  Query: {
    allTasks: async (obj, args, context) => {
      // Query diff table
      // Note: Diff table can contain only deletes that can be merged with original data
      if (args.lastSync) {
        const results = await getResultsFromDiffTable('task', args.limit, args.lastSync, context.db)
        console.log(results);
        return Connection(results.data, results.lastSync)
      }
      // Query original data
      const lastSync = new Date().getTime();
      const result = await context.db.collection('tasks').find({}).limit(args.limit || 50).toArray()
      result.forEach(item => item.id = item._id.toString());
      console.log(result);
      return Connection(result, lastSync)
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
        lastModified: new Date().getTime(),
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
      clientData.lastModified = new Date().getTime();
      const result = await context.db.collection('tasks').
        update({ _id: ObjectID(clientData.id) }, { $set: clientData })
      if (!result.result.ok) {
        throw new Error(`Invalid ID for task object: ${clientData.id}`);
      }
      const task = await context.db.collection('tasks').findOne({ _id: ObjectID(clientData.id) })
      publishAndSaveDiff(TASK_UPDATED, task, undefined, context.db)
      console.log("Update made", task)
      return task;
    },
    deleteTask: async (obj, args, context, info) => {
      console.log("Delete", args)
      const result = await context.db.collection('tasks').findOneAndDelete({ _id: ObjectID(args.id) })
      console.log(result);
      if (!result.value) {
        throw new Error("not deleted", result);
      }
      const deletedId = result.value._id
      result.value.id = result.value._id;
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
    deleted: actionType === TASK_DELETED
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
  const newSync = new Date().getTime()
  const data = db.collection(`${entryName}_delta`)
    .find({ _sortKey: { $gt: Number(lastSync) } })
    .limit(limit)
    .sort({ _sortKey: -1 }).toArray();

  if (data && data.length !== 0) {
    return {
      data,
      lastSync: newSync
    }
  } else {
    return {
      data: [],
      lastSync: newSync
    }
  }
}