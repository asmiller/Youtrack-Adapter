# Youtrack API Adapter
Helps automate Youtrack issue adding/editing from outside webhooks

This small node.js server listens for webhooks from an issue reporter (Rollbar, Raygun, form on your website, etc) and creates or updates Youtrack on changes.

It is made to modular, so that you can add additional services as desired.

Since the YouTrack api makes it difficult to search for issues after they have been created, a local Mongo database is used to keep track of the Youtrack issue associated with each webhook request.