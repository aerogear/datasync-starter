
/**
 * 
 * Wrap a specific resolver with the auth wrapper resolver
 * This has the actual auth prototype implementation
 * 
 * The wrapResolversWithAuth function below calls this function
 * for each resolver
 * 
 * @param resolverAuthInfo the config for a specific resolver
 * @param resolveFn the original resolver function
 * 
 */
function wrapResolverWithAuth(resolverAuthInfo: any, resolveFn: any): any {
  return async function resolve(obj, args, context, info) {
    let isAuthorizedByRole = false;
    let isAuthorizedOwner = false;
    if (resolverAuthInfo.roles && resolverAuthInfo.roles.length > 0) {
      isAuthorizedByRole = checkIsAuthorizedByRole(resolverAuthInfo.roles, context)
    }
    if (resolverAuthInfo.ownerAuth) {
      const ownerField = resolverAuthInfo.ownerField
      const modelName = resolverAuthInfo.modelName

      // if we're in a create type resolver then
      // set the owner field as the currently logged in user's ID
      if (isACreateResolver(info, modelName)) {
        isAuthorizedOwner = true
        args.input[ownerField] = args.input[ownerField] || context.kauth.accessToken.content.sub
      } else {
        const crudService = context[modelName]
        const result = await crudService.findBy({ id: args.input.id })
        const itemToUpdate = result[0]
        if (itemToUpdate && itemToUpdate[ownerField] && itemToUpdate[ownerField] === context.kauth.accessToken.content.sub) {
          isAuthorizedOwner = true
        }
      }
    }
    console.log(`resolvername: ${info.fieldName}, is authorized by role: ${isAuthorizedByRole}, is an authorized owner: ${isAuthorizedOwner}`)
    if (isAuthorizedByRole || isAuthorizedOwner) {
      return resolveFn(obj, args, context, info)
    }
    throw new Error(`User is not authorized.`)
  }
}

/**
 * 
 * @param resolversMap Resolver functions for your application
 * @param authInfo the auth config for the resolvers
 * 
 * Wraps the resolvers with a wrapper function that can perform auth checks
 * based on some config passed in
 */
export function wrapResolversWithAuth(resolversMap: any, models: any) {
  // parse the model config into auth configs per resolver
  const authInfo = createResolverAuthConfig(models)
  for (const parentKey of Object.keys(authInfo)) {
    for (const resolverKey of Object.keys(authInfo[parentKey])) {
      const authConfig = authInfo[parentKey][resolverKey]
      if (parentKey === 'Query' || parentKey === 'Mutation') {
        if (resolversMap[parentKey] && resolversMap[parentKey][resolverKey]) {
          console.log(`wrapping resolver ${resolverKey} with auth`, authConfig)
          resolversMap[parentKey][resolverKey] = wrapResolverWithAuth(authConfig, resolversMap[parentKey][resolverKey])
        }
      } else if (parentKey === 'Subscription') {
        // todo wrap subscription resolvers?
      } else {
        // todo wrap/create resolvers for a field
      }
    }
  }
  return resolversMap
}

function checkIsAuthorizedByRole(roles: string[], context?: any) {
  for (const role of roles) {
    if (context.kauth.hasRole(role)) {
      return true
    }
  }
  return false
}

function isACreateResolver(info: any, modelName: string) {
  return info.fieldName === `create${modelName}`
}

/**
 * this function takes the resolver config that you see in fakeAuthConfig and turns it into something like this
 * { Query: {findAllTasks: { roles: [...] ownerAuth: true, ownerField, 'owner'}}, Mutation: {...}}
 * 
 * The idea is that the config matches up to each resolver in the application
 * 
 * Eventually this would probably land inside a graphback plugin
 * as part of directive/annotation parsing logic
 * Also it's really messy but it can be refactored to be more understandable
 */
export function createResolverAuthConfig(models: any) {
  const result = { Query: {}, Mutation: {} }

  for (const model of models) {
    const modelAuthConfig = model.auth
    if (modelAuthConfig && modelAuthConfig.rules.length > 0) {
      for (const rule of modelAuthConfig.rules) {
        if (rule.allow === 'role' && rule.roles) {
          const { operations, roles } = rule
          for (const operation of operations) {
            if (operation === 'create' || operation === 'update' || operation === 'delete') {
              const operationName = `${operation}${model.name}`
              result.Mutation[operationName] = result.Mutation[operationName] || { roles: [], }
              for (const role of roles) {
                if (!result.Mutation[operationName].roles.includes(role)) {
                  result.Mutation[operationName].roles.push(role)
                }
              }
            } else if (operation === 'read') {
              const operationNames = [`find${model.name}s`, `findAll${model.name}s`]
              for (const operationName of operationNames) {
                result.Query[operationName] = result.Query[operationName] || { roles: [], modelName: model.name }
                for (const role of roles) {
                  if (!result.Query[operationName].roles.includes(role)) {
                    result.Query[operationName].roles.push(role)
                  }
                }
              }
            }
          }
        } else if (rule.allow === 'owner') {
          const { ownerField, operations } = rule
          for (const operation of operations) {
            if (operation === 'create' || operation === 'update' || operation === 'delete') {
              const operationName = `${operation}${model.name}`
              result.Mutation[operationName] = result.Mutation[operationName] || { roles: [], modelName: model.name }
              result.Mutation[operationName].ownerAuth = true
              result.Mutation[operationName].ownerField = ownerField || 'owner'
            } else if (operation === 'read') {

            }
          }
        }
      }
    }
  }
  return result
}
