import { element, by } from 'protractor';
import { GraphQLClient } from "graphql-request";

const taskFields = `
  fragment TaskFields on Task { 
    id
    version
    title
    description
    status
  }
`;

const createTask = `
  mutation createTask($title: String!) {
    createTask(title: $title, description: "") {
      ...TaskFields
    }
  }
  ${taskFields}
`;

const deleteTask = `
  mutation deleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Sync App', () => {
  it('Subscription', async () => {

    const client = new GraphQLClient('http://localhost:4000/graphql');

    // Open the Manage Tasks page
    await element(by.xpath('//app-home//ion-item[@routerlink="tasks"]')).click();

    // Assert that the test task doesn't already exists and delay a little bit the test
    // so that the websocket can be initialized
    expect(await element(by.xpath('//app-page-task//ion-item//ion-label//h2[.="test"]')).isPresent()).toBeFalsy();

    // Create the test task directly on the backend
    const task: any = await client.request(createTask, { title: "test" });

    // Assert that the test task appear  
    expect(await element(by.xpath('//app-page-task//ion-item//ion-label//h2[.="test"]')).isPresent()).toBeTruthy();

    // Delete the test task from the backend 
    await client.request(deleteTask, { id: task.createTask.id });

    // Assert that the test task disappear 
    expect(await element(by.xpath('//app-page-task//ion-item//ion-label//h2[.="test"]')).isPresent()).toBeFalsy();

    await sleep(10000);
  });
});