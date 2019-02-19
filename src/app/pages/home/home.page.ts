import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushService, PushMessage } from '../../services/push.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
    constructor(
        plt: Platform,
        push: PushService) {
        // We need to wait for the platform to initialize the plugins
        plt.ready().then(() => {
            push.initPush();
            push.setCallback((n) => this.addNotification(n));
            push.register();
        });
    }

    public addNotification(notification: PushMessage) {
        console.log(`Received push notification: ${notification.message}`);
    }
}
