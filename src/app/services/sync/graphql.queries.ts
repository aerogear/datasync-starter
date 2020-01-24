import gql from 'graphql-tag';

export const ADD_TASK = gql`
mutation createTask($description: String!, $title: String!, $status: TaskStatus){
    createTask(description: $description, title: $title, status: $status){
      id
      title
      description
      version
      status
    }
  }
`;

export const GET_TASKS = gql`
  fragment TaskFields on Task {
    id
    version
    title
    description
    status
    deleted
    lastModified
  }

  fragment TaskConnectionFields on TaskConnection{
    items{
      ...TaskFields
    }
    startedAt
  }
  query allTasks($lastSync: String) {
    allTasks(lastSync: $lastSync) {
      ...TaskConnectionFields
    }
}
`;

export const DELETE_TASK = gql`
mutation deleteTask($id: ID!){
  deleteTask(id: $id)
}
`;

export const UPDATE_TASK = gql`
mutation updateTask($description: String, $id: ID!, $title: String, $version: Int!, $status: TaskStatus) {
  updateTask(description: $description, id: $id, title: $title, version: $version, status: $status) {
    id
    title
    description
    version
    status
  }
}
`;

export const TASK_ADDED_SUBSCRIPTION = gql`
  subscription taskAdded {
      taskAdded {
        id
        title
        description
        version
        status
      }
  }
`;

export const TASK_DELETED_SUBSCRIPTION = gql`
  subscription taskDeleted {
      taskDeleted {
        id
        title
        description
        version
        status
      }
  }
`;

export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription taskUpdated {
      taskUpdated {
        id
        title
        description
        version
        status
      }
  }
`;
