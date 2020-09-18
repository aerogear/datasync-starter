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
import { DataSyncPlugin, createDataSyncMongoDbProvider, ThrowOnConflict, ServerSideWins} from "@graphback/datasync"
import { SchemaCRUDPlugin } from "@graphback/codegen-schema"
/**
 * Creates Apollo server
 */
export const createApolloServer = async function (app: Express, config: Config) {
    const db = await connect(config);

    const modelDefs = loadSchemaSync(resolve(__dirname, '../model/task.graphql'), {
        loaders: [
            new GraphQLFileLoader()
        ]
    })

    const { typeDefs, resolvers, contextCreator } = buildGraphbackAPI(modelDefs, {
        serviceCreator: createCRUDService(),
        dataProviderCreator: createDataSyncMongoDbProvider(db),
        plugins: [
            new SchemaCRUDPlugin({ outputPath: path.join(__dirname, "./schema/schema.graphql") }),
            new DataSyncPlugin({
                conflictConfig: {
                    enabled: true,
                    // Let's client side to deal with conflict
                    conflictResolution: ThrowOnConflict,
                }
            })
        ]
    });

    let apolloConfig: ApolloServerExpressConfig = {
        typeDefs: typeDefs,
        resolvers: { ...resolvers, ...customResolvers },
        playground: true,
        context: contextCreator
    }

    if (config.keycloakConfig) {
        apolloConfig = buildKeycloakApolloConfig(app, apolloConfig)
    }

    apolloConfig.resolvers = { ...apolloConfig.resolvers, ...customResolvers };

    const apolloServer = new ApolloServer(apolloConfig)
    apolloServer.applyMiddleware({ app });

    return apolloServer;
}
