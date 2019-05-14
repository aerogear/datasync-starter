import {
  ApolloOfflineClient, DataSyncConfig,
  OfflineQueueListener, ConflictListener, OfflineClient, OfflineStore, NetworkStatus
} from '@aerogear/voyager-client';
import { Injectable, Injector } from '@angular/core';
import { OpenShiftService } from '../openshift.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { taskCacheUpdates } from './cache.updates';
import { ADD_TASK } from './graphql.queries';

declare global {
  interface Window { voyagerClient: any; }
}

/**
 * Class used to log data conflicts in server
 */
class ConflictLogger implements ConflictListener {
  constructor(public alertCtrl: AlertController) { }
  async conflictOccurred(operationName: string, resolvedData: any, server: any, client: any) {
    const dialog = await this.alertCtrl.create({
      message: `Conflict on ${operationName}.</br>
      Version from server: ${server.version}.</br>`,
      header: `🤷 Data conflict occurred`,
      buttons: ['OK']
    });
    dialog.present();
    console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)} client: ${JSON.stringify(client)} `);
  }
}

export class ToggleableNetworkStatus implements NetworkStatus {
  online: boolean;
  callback: any;

  constructor() {
    this.online = true;
  }

  onStatusChangeListener(callback) {
    this.callback = callback;
  }

  isOffline(): Promise<boolean> {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  setOnline(online) {
    this.online = online;
    this.callback && this.callback.onStatusChange({ online });
  }
};

@Injectable({
  providedIn: 'root'
})
/**
 * Service provides Apollo Voyager client
 */
export class VoyagerService {

  private _apolloClient: ApolloOfflineClient;
  private _offlineStore: OfflineStore;

  constructor(private openShift: OpenShiftService, public alertCtrl: AlertController, public injector: Injector) {
  }

  get apolloClient(): ApolloOfflineClient {
    return this._apolloClient;
  }

  get offlineStore(): OfflineStore {
    return this._offlineStore;
  }

  public async createApolloClient() {
    const ns = new ToggleableNetworkStatus();
    // Merge all cache updates functions (currently only single)
    const mergedCacheUpdates = taskCacheUpdates;
    const options: DataSyncConfig = {
      conflictListener: new ConflictLogger(this.alertCtrl),
      fileUpload: true,
      mutationCacheUpdates: mergedCacheUpdates,
      networkStatus: ns
    };
    if (!this.openShift.hasSyncConfig()) {
      // Use default localhost urls when OpenShift config is missing
      options.httpUrl = 'http://localhost:4000/graphql';
      options.wsUrl = 'ws://localhost:4000/graphql';
    } else {
      options.openShiftConfig = this.openShift.getConfig();
    }
    const authService = this.injector.get(AuthService);
    if (authService.isEnabled()) {
      options.authContextProvider = authService.getAuthContextProvider();
    }

    const offlineClient = new OfflineClient(options);
    this._offlineStore = offlineClient.offlineStore;
    this._apolloClient = await offlineClient.init();


    window.voyagerClient = {
      offlineClient,
      ADD_TASK,
      ns
    };
  }
}
