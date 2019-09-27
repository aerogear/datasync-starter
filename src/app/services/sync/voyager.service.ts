import {
  ApolloOfflineClient,
  OfflineQueueListener, ConflictListener, OfflineClient, OfflineStore, isSubscription
} from 'offix-client';
import { defaultWebSocketLink } from '@aerogear/voyager-client'
import { Injectable, Injector } from '@angular/core';
import { OpenShiftConfigService } from '../config.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { taskCacheUpdates } from './cache.updates';
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import { MutationOptions } from 'apollo-client';

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
  async mergeOccurred(operationName: string, resolvedData: any, server: any, client: any) {
    const dialog = await this.alertCtrl.create({
      message: `Merged data ${operationName}.</br>,
      Version from server: ${server.version}.</br>`,
      header: `🎉 Auto merge occurred`
    });
    dialog.present();
    setTimeout(() => {
      dialog.dismiss();
    }, 5000);
    console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)} client: ${JSON.stringify(client)} `);
  }
}

@Injectable({
  providedIn: 'root'
})
/**
 * Service provides Apollo Voyager client
 */
export class VoyagerService {

  private _apolloClient: ApolloOfflineClient;
  private _offlineStore: OfflineStore<MutationOptions>;

  constructor(private openShift: OpenShiftConfigService, public alertCtrl: AlertController, public injector: Injector) {
  }

  get apolloClient(): ApolloOfflineClient {
    return this._apolloClient;
  }

  get offlineStore(): OfflineStore<MutationOptions> {
    return this._offlineStore;
  }

  public async createApolloClient() {
    const options: any = {
      conflictListener: new ConflictLogger(this.alertCtrl),
      fileUpload: true,
      mutationCacheUpdates: taskCacheUpdates
    };

    if (!this.openShift.hasSyncConfig()) {
      // Use default localhost urls when OpenShift config is missing
      options.httpUrl = this.openShift.getLocalServerUrl();
      options.wsUrl = this.openShift.getWSLocalServerUrl();
    } else {
      options.openShiftConfig = this.openShift.getConfig();
    }
    const authService = this.injector.get(AuthService);
    if (authService.isEnabled() && await authService.initialized) {
      options.authContextProvider = authService.getAuthContextProvider();
    }

    const wsLink = defaultWebSocketLink(options, { uri: options.wsUrl })
    const httpLink = new HttpLink({
      uri: options.httpUrl,
    }) as ApolloLink;

    const terminatingLink = ApolloLink.split(isSubscription, wsLink, httpLink);

    options.terminatingLink = terminatingLink

    const offlineClient = new OfflineClient(options);
    this._offlineStore = offlineClient.offlineStore;
    this._apolloClient = await offlineClient.init();
  }
}
