import { ModelAuthConfigs } from "@graphback/keycloak-authz"

export const authConfig: ModelAuthConfigs = [
  {
    name: 'Task',
    auth: {
      rules: [
        {
          allow: 'role',
          operations: ['update', 'delete'],
          roles: ["admin"]
        }
      ]
    }
  }
]