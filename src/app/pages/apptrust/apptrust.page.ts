import {Component, OnInit} from '@angular/core';
// import {CheckResultMetrics, DeviceCheckResult, DeviceCheckType, SecurityService} from '@aerogear/security';
// import {Dialogs} from '@ionic-native/dialogs/ngx';
// import {Platform} from '@ionic/angular';
// import {MetricsService} from '@aerogear/core';
// import {OpenShiftService, Service} from '../../services/openshift.service';


declare var navigator: any;
@Component({
    selector: 'apptrust',
    templateUrl: './apptrust.page.html',
    styleUrls: ['./apptrust.page.scss'],
})

export class AppTrustPage implements OnInit {
  private static readonly METRICS_KEY = 'security';

  ngOnInit() {
  }

  public isAvailable() {
      // return this.platform.is('cordova');
      return true;
  }


  public ionViewWillEnter(): void {
    if (this.isAvailable()) {
    }
  }
}
