import { ModelAuthConfigs } from "@graphback/keycloak-authz"

export const authConfig: ModelAuthConfigs = [
  {
    name: 'Task',
    auth: {
      rules: [
        {
          allow: 'owner',
          operations: ['update', 'create', 'read', 'delete'],
          ownerField: 'owner',
        },
        {
          allow: 'role',
          operations: ['update', 'delete'],
          roles: ["admin"]
        }
      ]
    }
  }
]