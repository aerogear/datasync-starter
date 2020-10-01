import { GraphbackOperationType } from '@graphback/core'
import { KeycloakCrudService } from '@graphback/keycloak-authz'
import { ModelDefinition, GraphbackCRUDService, CRUDServiceConfig } from 'graphback';
import { DataSyncProvider, DataSyncCRUDService } from '@graphback/datasync';
import { connectToPubSub } from './pubsub';
import { config } from "./config/config"
import { authConfig } from "./config/auth"
import { PubSub } from 'graphql-subscriptions';

/**
 * Creates Graphback service with following capabilities:
 * 
 * - DataSync
 * - Keycloak
 * - AMQ custom topics
 *
 * This functions tries to enable various capabilities based on the config provided
 */
export function createCRUDService(globalServiceConfig?: CRUDServiceConfig) {
    let pubSub;
    if (config.mqttConfig) {
        pubSub = connectToPubSub();
    } else {
        pubSub = new PubSub();
    }

    return (model: ModelDefinition, dataProvider: DataSyncProvider): GraphbackCRUDService => {
        const serviceConfig: CRUDServiceConfig = {
            pubSub,
            ...globalServiceConfig,
            crudOptions: model.crudOptions
        }
        let service
        if (config.mqttConfig) {
            service = new AMQCRUDDataSyncService(model, dataProvider, serviceConfig);
        } else {
            service = new DataSyncCRUDService(model, dataProvider, serviceConfig);
        }

        if (config.keycloakConfig) {
            const objConfig = authConfig[model.graphqlType.name];
            const keycloakService = new KeycloakCrudService(model, { service, authConfig: objConfig });

            return keycloakService;
        }

        return service;
    }
}

/**
 * Service that allows you to configure how AMQ topics are build
 */
export class AMQCRUDDataSyncService extends DataSyncCRUDService {
    constructor(model: ModelDefinition, db: DataSyncProvider, config: CRUDServiceConfig) {
        super(model, db, config);
    }
    protected subscriptionTopicMapping(triggerType: GraphbackOperationType, objectName: string) {
        // Support AMQ topic creation format
        return `graphql/${objectName}_${triggerType}`
    }
}