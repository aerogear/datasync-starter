const mergeResolvers = require("deepmerge").all
const mergeTypes = require('merge-graphql-schemas').mergeTypes;
const { GraphQLDateTime } = require('graphql-iso-date')

const {
    taskTypeDefs,
    subscriptionTypeDefs,
    taskResolvers,
    subscriptionResolvers
} = require('./tasks')


const {
    fileTypeDefs,
    fileResolvers,
} = require('./files')
// TODO Replace with GraphQL-modules once Voyager will allow for that

const dateTypeDefs = `
scalar GraphQLDateTime
`

const dateResolvers = {
    GraphQLDateTime: GraphQLDateTime
}

const appResolvers = mergeResolvers([dateResolvers, taskResolvers, subscriptionResolvers])
const appTypeDefs = mergeTypes([dateTypeDefs, taskTypeDefs, subscriptionTypeDefs],
    { all: true })

module.exports = {
    appTypeDefs, appResolvers
}