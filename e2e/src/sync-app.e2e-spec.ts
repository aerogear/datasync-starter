import { element, by } from 'protractor';
import { GraphQLClient } from 'graphql-request';

const createTask = `
  mutation createTask($title: String!) {
    createTask(title: $title, description: "") {
      id
    }
  }
`;

const deleteTask = `
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
  return element.all(by.id('e2e-tasks-list')).all(by.className('e2e-task-item'));
}

/**
 * Find only the title of all tasks inside the tasks page
 */
function findTasksTitles() {
  return findTasks().all(by.className('e2e-task-title')).getText();
}

describe('Sync App', () => {
  it('Subscription', async () => {

    // TODO: Configurable
    const client = new GraphQLClient('http://localhost:4000/graphql');

    // Open the Manage Tasks page
    await goToTasks();

    // Assert that the test task doesn't already exists and delay a little bit the test
    // so that the websocket can be initialized
    expect(await findTasksTitles()).toEqual([]);

    // Create the test task directly on the backend
    const task: any = await client.request(createTask, { title: 'test' });

    // Assert that the test task appear
    expect(await findTasksTitles()).toEqual(['test']);

    // Delete the test task from the backend
    await client.request(deleteTask, { id: task.createTask.id });

    // Assert that the test task disappear
    expect(await findTasksTitles()).toEqual([]);

  });
});
