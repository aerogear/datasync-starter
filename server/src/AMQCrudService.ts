import { GraphbackOperationType } from '@graphback/core'
import { KeycloakCrudService } from '@graphback/keycloak-authz'


export class AMQCRUDService extends KeycloakCrudService {
    protected subscriptionTopicMapping(triggerType: GraphbackOperationType, objectName: string) {
        // Support AMQ topic creation format
        return `graphql/${objectName}_${triggerType}`
    }
}