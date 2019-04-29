// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { config } = require('./protractor.conf');
const path = require('path');

config.seleniumAddress = 'http://localhost:4723/wd/hub';
config.capabilities = {
  browserName: '',
  platformName: 'Android',
  deviceName: 'Android Emulator',
  app: path.join(__dirname, '../platforms/android/app/build/outputs/apk/debug/app-debug.apk'),
  autoWebview: true,
};
config.beforeLaunch = function () { };
config.afterLaunch = function () { };

exports.config = config;
