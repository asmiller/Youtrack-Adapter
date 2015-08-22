# Youtrack API Adapter
This small node.js server automates Youtrack issue management from outside webhooks.

The server listens for webhook request from an issue reporter (Rollbar, Raygun, form on your website, etc) and creates or updates Youtrack issues appropriately. I like the simplicity of Youtrack, but their API did not directly work with webhooks from other services.

Since the YouTrack api makes it difficult to search for issues after they have been created, a local Mongo database is used to keep track of the Youtrack issue associated with each webhook request.

The code is written modularly, so it shouldn't be hard to add additional reporting services as desired.

##Installation
```
git clone https://github.com/asmiller/Youtrack-Adapter.git
cd Youtrack-Adapter
npm install
```

Edit config.json.sample to contain your server information, and save as config.json.

To run the server, just call

```
node server.js
```

##Setting up services

###Rollbar
Go into your Rollbar project settings and enable a Webhook notification. Set the url to point at your server, with a path of /rollbar (eg, https://bugs.myserver.com/rollbar)
