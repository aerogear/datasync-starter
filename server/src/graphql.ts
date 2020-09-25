import * as path from 'path';
import { resolve } from 'path';
import { connect } from './db';
import { Config } from './config/config';
import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import { Express } from "express";
import customResolvers from './resolvers/custom';
import { buildKeycloakApolloConfig } from './auth';
import { createCRUDService } from './crudServiceCreator'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { buildGraphbackAPI } from "graphback"
import { DataSyncPlugin, createDataSyncConflictProviderCreator, ThrowOnConflict } from "@graphback/datasync"
import { SchemaCRUDPlugin } from "@graphback/codegen-schema"
import { printSchema } from 'graphql';
/**
 * Creates Apollo server
 */
export const createApolloServer = async function (app: Express, config: Config) {

    const modelDefs = loadSchemaSync(resolve(__dirname, '../model/model.graphql'), {
        loaders: [
            new GraphQLFileLoader()
        ]
    })
 
    let resolversToLoad = customResolvers
    if (process.env.RESOLVERS) {
        resolversToLoad = eval(process.env.RESOLVERS);
    }

    let apolloConfig: ApolloServerExpressConfig = {
        typeDefs: printSchema(modelDefs),
        resolvers: resolversToLoad,
        playground: true
    }

    const apolloServer = new ApolloServer(apolloConfig)
    apolloServer.applyMiddleware({ app });

    return apolloServer;
}
