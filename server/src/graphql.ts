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
import { buildKeycloakApolloConfig } from './auth';
import { createKeycloakRuntimeContext, KeycloakCrudService } from '@graphback/keycloak-authz';
import { authConfig } from './config/auth';
import { OffixMongoDBDataProvider, createOffixMongoCRUDRuntimeContext, CRUDService } from '@graphback/runtime-mongo';
import { AMQCRUDService } from './AMQCrudService'

/**
 * Creates Apollo server
 */
export const createApolloServer = async function (app: Express, config: Config) {
    const db = await connect(config);
    const pubSub = getPubSub();

    const typeDefs = loadSchemaFiles(join(__dirname, '/schema/')).join('\n');
    const schema = buildSchema(typeDefs, { assumeValid: true });

    let apolloConfig: any = {
        typeDefs: typeDefs,
        resolvers,
        playground: true,
    };

    if (config.keycloakConfig) {
        apolloConfig.context = createKeycloakRuntimeContext({
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
        apolloConfig.context = createOffixMongoCRUDRuntimeContext(models, schema, db, pubSub);
    }

    const apolloServer = new ApolloServer(apolloConfig)
    apolloServer.applyMiddleware({ app });

    return apolloServer;
}
