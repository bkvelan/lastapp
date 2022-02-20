import { Component } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx/FCM';
import { Network } from "@ionic-native/network/ngx";
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  tokenID: any = ''; DeviceID: any = '';
  constructor(
    private platform: Platform, public toastController: ToastController,
    private Device: Device, public alertController: AlertController,
    // private statusBar: StatusBar,
    public iab: InAppBrowser,
    private fcm: FCM, public network: Network
  ) {
    this.initializeApp();
    this.NetworkStatus();
  }
  async NetworkStatus() {
    let disconct = this.network.onDisconnect();
    console.log("disconct", disconct);
    // const load = await this.presentAlert();
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log("Network was disconnected :-(");
      this.presentToast("Your in offline");
      // this.presentAlert()
      alert("Your internet connection seems to be down. Please retry once it's back.");
      // load.present();
    });
    error => {
      //  alert("eroor");
    };
    // disconnectSubscription.unsubscribe();
    let conc = this.network.onConnect();
    console.log(conc, "connected");
    //  disconnectSubscription.unsubscribe();
    let connectSubscription = this.network.onConnect().subscribe(() => {
      // alert("Network was connected ");

      this.presentToast(this.network.type + " " + "network was connected");
      // load.dismiss()
    });

    // stop connect watch
    // connectSubscription.unsubscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      // subscribe to a topic
      // this.fcm.subscribeToTopic('Deals');
      // get FCM token
      this.fcm.getToken().then(token => {
        console.log('this.tokenID', token);
        // alert(token)
        this.tokenID = token;
        if (this.tokenID) {
          this.redirect();
        }
      });
      // ionic push notification example
      this.fcm.onNotification().subscribe(data => {
        console.log(data);
        if (data.wasTapped) {
          console.log('Received in background');
        } else {
          console.log('Received in foreground');
        }
      });
      // refresh the FCM token
      this.fcm.onTokenRefresh().subscribe(token => {
        console.log('this.tokenID', token);
        // alert(token)
        this.tokenID = token;
      });
      this.DeviceID = this.Device.uuid;


      console.log(this.Device.uuid, "device id");
      // unsubscribe from a topic
      // this.fcm.unsubscribeFromTopic('offers');
    });
  }

  redirect() {
    console.log("app start 123")
    localStorage.setItem("DeviceID", this.DeviceID)

    const options: InAppBrowserOptions = {
      zoom: 'no',
      location: 'no',
      toolbar: 'no',
      clearcache: 'yes',
      cleardata: 'yes',
      fullscreen: 'no',
      // clearsessioncache: 'no',
      hardwareback: 'yes',
      // fullscreen:'no',
      allowInlineMediaPlayback: "yes"
    };


    // "https://app.dropzy.in/public/dropzy/outlet-categories.html?id="

    //  "https://app.dropzy.in/public/dropzy/index.html?id=" 

    var link = 'https://app.dropzy.in/public/dropzy/index.html?id=' + this.DeviceID + '&Firebaseid=' + this.tokenID;
    // link = "https://www.google.com/"
    console.log(link, "link hits");

    const browser = this.iab.create(link, '_blank', {
      'location': 'no', 'hideurlbar': 'yes', 'hidenavigationbuttons': 'yes', 'closebuttoncaption': 'Logout', 'zoom': 'no', statusbar: { color: '#91BBE1' },
      fullscreen: 'no', toolbar: 'no', hardwareback: 'yes',
    });
    browser.on('loadstop').subscribe(() => {
      browser.executeScript({ code: 'window.location' }).then((location) => {
        // do something with location
        let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
          console.log("Network was disconnected :-(");
          this.presentToast("Your in offline");
          this.presentAlert("Your internet connection seems to be down. Please retry once it's back..");
          // load.present();
        });
      });
      browser.executeScript({ code: 'document.cookie' }).then((cookies) => {
        // do something with cookies
      });
      browser.executeScript({ code: 'console.log("foo")' });
    });
    browser.on('exit').subscribe(() => {
      console.log('browser closed');
      // this.ngPassword=false;
      // this.userName="";
      // window.location.reload();
      // this.ifRegister = false;
      navigator['app'].exitApp();
      localStorage.clear();
    }, err => {
      console.error(err);
    });



    //old
    // const browser = this.iab.create(link, '_blank', { 'location': 'no', 'hideurlbar': 'yes', 'hidenavigationbuttons': 'yes', 'closebuttoncaption': 'Logout', 'zoom': 'no' });
    // browser.on('loadstart').subscribe((event) => {

    //   console.log("browser open")

    // }, err => {
    //   console.error(err);
    // });



    // browser.on('exit').subscribe(() => {
    //   navigator['app'].exitApp();
    // })
  }
  async presentAlert(data?) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: data,
      subHeader: 'Subtitle',
      message: 'This is an alert message.',
      buttons: ['OK']
    });
    return alert;
    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  async presentToast(as) {
    const toast = await this.toastController.create({
      message: as,
      duration: 2000
    });
    toast.present();
  }
}
