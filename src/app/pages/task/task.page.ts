import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { ItemService } from '../../services/sync/item.service';
import { Task } from '../../services/sync/types';
import { NetworkService } from '../../services/network.service';
import { VoyagerService } from '../../services/sync/voyager.service';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ObservableQuery } from 'apollo-client'


@Component({
  selector: 'app-page-task',
  templateUrl: 'task.page.html',
  styleUrls: ['task.page.scss'],
})

export class TaskPage implements OnInit {

  item: Task;
  items: Array<Task>;
  online: boolean;
  queue: number;
  errors: any;
  cases: { case: string; }[];
  selectedSegment = 'all';
  getTasksQuery: ObservableQuery
  // todo where do we store this? Possibly don't need to because the value is cached.
  // with cache persistence and using cache-and-network policy
  // the query will first hit the cache which will give us back the previous value,
  // then we can set lastSync again
  lastSync?: string 

  constructor(
    private router: Router,
    public itemService: ItemService,
    public networkService: NetworkService,
    public aerogear: VoyagerService,
    public toastController: ToastController,
    public auth: AuthService,
    public alertCtrl: AlertController,
  ) {
    this.items = [];
    this.cases = [{ case: 'all' }, { case: 'open' }];
    this.getTasksQuery = this.itemService.getItems() as any
  }

  async ngOnInit() {
    await this.auth.initialized;
    // Root element of the data app
    // When view is initialized:
    // We try to do network request first to get fresh data
    // Then we subscribe to any updates that happen in local cache
    // Local cache can be updated by mutations that happen on the app
    await this.loadData();
    await this.setupQueueStatusBar();
  }

  // Setup status bar that shows online status
  private async setupQueueStatusBar() {
    this.online = !await this.networkService.networkInterface.isOffline();
    this.networkService.networkInterface.onStatusChangeListener({
      onStatusChange: (networkInfo) => {
        console.log(`Network state changed. Online: ${networkInfo.online}`);
        this.online = networkInfo.online;

        // sync when we come back online
        if (this.online === true) {
          this.sync()
        }
      }
    });
    console.log(`Online: ${this.online}`);
    console.log(`NetworkStatus Provider: ${this.networkService.networkInterface.constructor.name}`);
    const self = this;
    this.aerogear.apolloClient.registerOfflineEventListener({
      onOperationEnqueued() {
        self.queue = self.queue + 1;
      },
      queueCleared() {
        self.queue = 0;
      },
      onOperationFailure: ({ op }) => {
        this.alertCtrl.create({
          message: `Failed to replicate offline change: ${op.context.operationName}`
        }).then((dialog) => {
          dialog.present();
        });
      }
    });
    this.queue = 0;
  }

  private async loadData() {
    // Subscribe to local cache changes
    
    this.getTasksQuery.subscribe(result => {
      if (result && !result.errors) {
        console.log('Result from query', result);
        this.lastSync = result.data.allTasks.lastSync
        this.items = result.data && result.data.allTasks.items;
      } else {
        console.log('error from query', result);
        this.presentToast('Cannot load data');
      }
    }, error => {
      console.log('error from query', error);
      this.presentToast('Problem with listening to cache changes.');
    });
  }

  sync() {
    const lastSync = this.lastSync;
    const queryName = this.getTasksQuery.queryName

    // fetchmore lets you call the same query again with different params
    // and have the results merged back under the same query within the cache
    this.getTasksQuery.fetchMore({
      variables: { lastSync },

      // todo this should probably become a helper function in offix
      updateQuery: (prev, { fetchMoreResult }) => {
        const previous = prev[queryName]
        const next = fetchMoreResult[queryName]
        const newItems = this.mergeSyncResult(previous.items, next.items, "id")
        return {
          [queryName]: {
            items: newItems,
            lastSync: next.lastSync,
            __typename: next.__typename
          }
        }
      }
    })
  }

  // TODO this should probably be in offix
  // function that takes two arrays of objects
  // merges nextItems on top of currentItems basing on a given idField,

  // for each item in currentItems we loop through nextItems to find a match
  // if there's a match we replace the original item with the newly updated one
  // then we filter out deletes
  // Complexity is roughly O(n^2) + n

  mergeSyncResult(currentItems: any[], nextItems: any[], idField: string) {

    const result = currentItems
    .map((currentItem) => {
      const nextItemIndex = nextItems.findIndex((nextItem) => { return currentItem[idField] === nextItem[idField] })
      if (nextItemIndex != -1) {
        return nextItems.splice(nextItemIndex, 1)[0]
      }
      return currentItem
    })
    .concat(nextItems)
    .filter((item) => { return item.deleted != true})
    return result
  }

  openNewItemPage() {
    this.router.navigate(['/new-item']);
  }

  goToItem(item) {
    this.router.navigate(['/update-item', item]);
  }

  deleteItem(item) {
    this.itemService.deleteItem(item).then(result => {
      console.log('Result from delete mutation', result);
      this.presentToast('Item deleted');
    });
  }

  markItemStatus(item) {
    let newValues;
    if (item.status === 'COMPLETE') {
      newValues = {
        ...item,
        status: 'OPEN'
      };
    } else {
      newValues = {
        ...item,
        status: 'COMPLETE'
      };
    }
    this.itemService.updateItem(newValues).then(result => {
      console.log('Result from server for mutation', result);
    }).catch((error) => {
      console.error(error);
    });
  }

  isChecked(item) {
    if (item.status === 'COMPLETE') {
      return true;
    }
    return false;
  }

  checkCase(itemCase, item) {
    if (itemCase.case === 'open') {
      if (item.status === 'OPEN') {
        return true;
      }
      return false;
    }
    return true;
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}

