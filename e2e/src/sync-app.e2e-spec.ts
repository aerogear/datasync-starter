import { element, by } from 'protractor';
import { GraphQLClient } from 'graphql-request';

const SYNC_APP_URL = 'http://localhost:4000/graphql';

const CREATE_TASK = `
  mutation createTask($title: String!) {
    createTask(title: $title, description: "") {
      id
    }
  }
`;

const DELETE_TASK = `
  mutation deleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

/**
 * Open the Tasks page
 */
function goToTasks() {
  return element(by.css('#e2e-link-to-tasks')).click();
}

/**
 * Find all tasks inside the tasks page
 */
function findTasks() {
  return element.all(by.css('#e2e-tasks-list .e2e-task-item'));
}

/**
 * Find only the title of all tasks inside the tasks page
 */
function findTasksTitles() {
  return findTasks().all(by.css('.e2e-task-title')).getText();
}

describe('Sync App', () => {
  it('Subscription', async () => {

    const client = new GraphQLClient(SYNC_APP_URL);

    // Open the Manage Tasks page
    await goToTasks();

    // Assert that the test task doesn't already exists and delay a little bit the test
    // so that the websocket can be initialized
    expect(await findTasksTitles()).toEqual([]);

    // Create the test task directly on the backend
    const task: any = await client.request(CREATE_TASK, { title: 'test' });

    // Assert that the test task appear
    expect(await findTasksTitles()).toEqual(['test']);

    // Delete the test task from the backend
    await client.request(DELETE_TASK, { id: task.createTask.id });

    // Assert that the test task disappear
    expect(await findTasksTitles()).toEqual([]);

  });
});
