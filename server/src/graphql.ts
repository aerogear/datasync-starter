import { loadSchemaFiles } from '@graphql-toolkit/file-loading';
import { buildSchema } from 'graphql';
import { join } from 'path';
import { connect } from './db';
import resolvers from './resolvers/resolvers';
import { models } from './resolvers/models'
import { getPubSub } from './pubsub'
import { Config } from './config/config';
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import scalars from './resolvers/scalars';
import { buildKeycloakApolloConfig } from './auth';
import { createKeycloakRuntimeContext } from '@graphback/keycloak-authz';
import { authConfig } from './config/auth';
import { OffixMongoDBDataProvider, createOffixMongoCRUDRuntimeContext } from '@graphback/runtime-mongo';
import { AMQCRUDService } from './AMQCrudService'

/**
 * Creates Apollo server
 */
export const createApolloServer = async function (app: Express, config: Config) {
    const db = await connect(config);
    const pubSub = getPubSub();

    const typeDefs = loadSchemaFiles(join(__dirname, '/schema/')).join('\n');
    const schema = buildSchema(typeDefs, { assumeValid: true });
    let context;

    let apolloConfig;

    if (config.keycloakConfig) {
        context = createKeycloakRuntimeContext({
            models,
            schema,
            db,
            pubSub,
            authConfig,
            dataProvider: OffixMongoDBDataProvider,
            crudService: AMQCRUDService
        })
        apolloConfig = buildKeycloakApolloConfig(app, apolloConfig)
    } else {
        context = createOffixMongoCRUDRuntimeContext(models, schema, db, pubSub);
        apolloConfig = {
            typeDefs: typeDefs,
            resolvers,
            playground: true,
            context: context
        }
    }

    apolloConfig.resolvers = { ...apolloConfig.resolvers, ...scalars };

    const apolloServer = new ApolloServer(apolloConfig)
    apolloServer.applyMiddleware({ app });

    return apolloServer;
}
