var config = require('./config.json');
var db = require('monk')(config.db.url, config.db.options);
var issues = db.get('issues');

//set up Mongo indices
issues.index('issueId source project');

module.exports = issues;
