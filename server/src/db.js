const MongoClient = require('mongodb').MongoClient;

async function connect(options) {
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'showcase';

  // Use connect method to connect to the server
  const client = await MongoClient.connect(url)
  const db = client.db(dbName);
  return db
}

module.exports = connect
