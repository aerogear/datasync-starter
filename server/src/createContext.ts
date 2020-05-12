import { GraphbackPubSubModel, OffixMongoDBDataProvider } from '@graphback/runtime-mongo'
import { GraphQLSchema, GraphQLObjectType } from 'graphql'
import { Db } from 'mongodb'
import { PubSubEngine } from 'apollo-server-express'
import { GraphbackOperationType } from '@graphback/core'
import { KeycloakCrudService, createCrudServiceAuthConfigs } from '@graphback/keycloak-authz'
import { authConfig } from "./config/auth";


class AMQCRUDService extends KeycloakCrudService {
    protected subscriptionTopicMapping(triggerType: GraphbackOperationType, objectName: string) {
        // Support AMQ topic creation format
        return `graphql/${objectName}_${triggerType}`
    }
}

/**
 * Helper function for creating mongodb runtime context used in Graphback
 * 
 * @param schema 
 * @param db 
 * @param pubSub 
 */
export const createOffixMongoCRUDRuntimeContext = (
    models: GraphbackPubSubModel[], schema: GraphQLSchema,
    db: Db, pubSub: PubSubEngine
) => {
    if (!models || models.length === 0) {
        throw new Error(`No models provided`)
    }

    const serviceAuthConfigs = createCrudServiceAuthConfigs(authConfig);

    return models.reduce((services: any, model: GraphbackPubSubModel) => {
        const modelType = schema.getType(model.name) as GraphQLObjectType
        if (modelType === undefined) {
            throw new Error(`
        Schema is missing provided type. 
        Please make sure that you pass the right schema to createCRUDRuntimeContext`)
        }

        const objectDB = new OffixMongoDBDataProvider(modelType, db)

        services[model.name] = new AMQCRUDService({
            modelType,
            db: objectDB,
            subscriptionConfig: {
                pubSub,
                ...model.pubSub
            },
            authConfig: serviceAuthConfigs[model.name]
        })

        return services;
    }, {})

}