import { CRUDService, GraphbackDataProvider, GraphbackPubSub } from "@graphback/runtime";
import { GraphbackOperationType } from '@graphback/core';
import { GraphQLObjectType } from 'graphql'

export type CrudOperationAuthRules = {
  roles: string[]
}


export type CrudServiceAuthRules = {
  create: CrudOperationAuthRules,
  read: CrudOperationAuthRules,
  update: CrudOperationAuthRules,
  delete: CrudOperationAuthRules,
}

export type KeycloakCrudServiceOptions = {
  modelType: GraphQLObjectType,
  db: GraphbackDataProvider,
  subscriptionConfig: GraphbackPubSub,
  authRules: CrudServiceAuthRules,
}

/**
 * This custom CRUD Service shows another potential way to add auth
 * 
 * This is actually quite nice and clean but it does not allow for field level auth.
 * It's still a possibility that we could go with though!
 */
export class KeycloakCrudService<T = any> extends CRUDService {

  private authRules: CrudServiceAuthRules;

  constructor({ modelType, db, subscriptionConfig, authRules }: KeycloakCrudServiceOptions) {
    super(modelType, db, subscriptionConfig);
    this.authRules = authRules
  }

  public async create(data: T, context?: any): Promise<T> {
    if (this.authRules.create.roles.length > 0) {
      const { roles } = this.authRules.create
      if (!isAuthorizedByRole(roles, context)) {
        throw new Error(`User is not authorized. Must have one of the following roles: [${roles}]`)
      }
    }
    return super.create(data, context)
  }

  public async update(data: T, context?: any): Promise<T> {
    if (this.authRules.update.roles.length > 0) {
      const { roles } = this.authRules.update
      if (!isAuthorizedByRole(roles, context)) {
        throw new Error(`User is not authorized. Must have one of the following roles: [${roles}]`)
      }
    }
    return super.update(data, context)
  }

  public async delete(data: T, context?: any): Promise<T> { 
    if (this.authRules.delete.roles.length > 0) {
      const { roles } = this.authRules.delete
      if (!isAuthorizedByRole(roles, context)) {
        throw new Error(`User is not authorized. Must have one of the following roles: [${roles}]`)
      }
    }
    return super.delete(data, context)
  }

  public findAll(context?: any): Promise<T[]> {
    if (this.authRules.read.roles.length > 0) {
      const { roles } = this.authRules.read
      if (!isAuthorizedByRole(roles, context)) {
        throw new Error(`User is not authorized. Must have one of the following roles: [${roles}]`)
      }
    }
    return super.findAll(context)
  }

  public findBy(filter: any, context?: any): Promise<T[]> {
    if (this.authRules.read.roles.length > 0) {
      const { roles } = this.authRules.read
      if (!isAuthorizedByRole(roles, context)) {
        throw new Error(`User is not authorized. Must have one of the following roles: [${roles}]`)
      }
    }
    return super.findBy(filter, context)
  }

  protected subscriptionTopicMapping(triggerType: GraphbackOperationType, objectName: string) {
    // Support AMQ topic creation format
    return `graphql/${objectName}_${triggerType}`
}
}

function isAuthorizedByRole(roles: string[], context?: any) {
  for (const role of roles) {
    if (context.kauth.hasRole(role)) {
      return true
    }
  }
  return false
}