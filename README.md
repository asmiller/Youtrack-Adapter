# Youtrack API Adapter
This small node.js server automates Youtrack issue management from outside webhooks.

The server listens for webhook request from an issue reporter (Rollbar, Raygun, form on your website, etc) and creates or updates Youtrack issues appropriately. I like the simplicity of Youtrack, but their API did not directly work with webhooks from other services.

Since the YouTrack api makes it difficult to search for issues after they have been created, a local Mongo database is used to keep track of the Youtrack issue associated with each webhook request.

The code is written modularly, so it shouldn't be hard to add additional reporting services as desired.
