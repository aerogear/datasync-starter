const mergeResolvers = require("deepmerge").all
const mergeTypes = require('merge-graphql-schemas').mergeTypes;
const { LongResolver } = require('graphql-scalars')

const {
    taskTypeDefs,
    subscriptionTypeDefs,
    taskResolvers,
    subscriptionResolvers
} = require('./tasks')


// Doesn't work
const timestampTypedef = `
scalar Long
`

// Using large number as we might use nanoseconds that do not fit to timestamp format
const timestampResolver = {
    Long: LongResolver
}

const appResolvers = mergeResolvers([timestampResolver, taskResolvers, subscriptionResolvers])
console.log(Object.keys(appResolvers))
const appTypeDefs = mergeTypes([timestampTypedef, taskTypeDefs, subscriptionTypeDefs],
    { all: true })

module.exports = {
    appTypeDefs, appResolvers
}