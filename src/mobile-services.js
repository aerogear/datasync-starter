let config = {
  "version": 1,
  "namespace": "voyager",
  "clientId": "voyager-ionic-example",
  "services": [
    {
      "id": "push",
      "name": "push",
      "type": "push",
      "url": "https://ups-collab-project.comm2.skunkhenry.com",
      "config": {
        "android": {
          "senderID": "881192658444",
          "variantId": "94ece8da-a7e6-41f6-ab15-2798217794db",
          "variantSecret": "d1b94986-db44-4c9a-8881-3a7738fcf71e"
        }
      }
    }
  ]
};

module.exports = config;
