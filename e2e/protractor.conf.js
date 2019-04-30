// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
var { Local: BrowserStackLocal } = require('browserstack-local');

let browserStackLocal;

exports.config = {
  seleniumAddress: 'http://hub.browserstack.com/wd/hub',
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    project: 'ionic-showcase',
    browserName: '',
    device: 'Google Pixel',
    app: process.env.BROWSERSTACK_APP,
    autoWebview: true,
    'browserstack.user': process.env.BROWSERSTACK_USER,
    'browserstack.key': process.env.BROWSERSTACK_KEY,
    'browserstack.local': true,
    'browserstack.debug': true,
  },
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },

  // Code to start browserstack local before start of test
  beforeLaunch: function () {
    return new Promise(function (resolve, reject) {
      browserStackLocal = new BrowserStackLocal();
      browserStackLocal.start({
        key: process.env.BROWSERSTACK_KEY,
        force: true,
        verbose: true,
        logFile: '/tmp/bs-local.log'
      }, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  // Code to stop browserstack local after end of test
  afterLaunch: function () {
    return new Promise(function (resolve, reject) {
      browserStackLocal.stop(resolve);
    });
  }
};
