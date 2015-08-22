var restler = require('restler');
var config = require('./config.json');
var xml2json = require('xml2js').parseString;
var q = require('Q');
var db = require('monk')(config.db.url, config.db.options);
var issues = db.get('issues');
var token;

var youtrack = {};

//set up Mongo indices
issues.index('issueId source project');

//Log in to YouTrack
restler.post(config.youtrack.url + '/rest/user/login', {
    data: {
        login: config.youtrack.username,
        password: config.youtrack.password
    }
}).on('complete', function (data, respObj) {
    if (data instanceof Error || !respObj.headers['Set-Cookie']) {
        console.error('Error logging in to YouTrack');
        console.dir(data);
    } else {
        console.dir(respObj.headers);
    }
});


/**
 * Create a new issue in YouTrack. The data parameter must follow the following protocol:
 *
 * issueId (required): the id from the source reporter
 * project (required): the youTrack project
 * source (required): the name of the source reporter
 * summary (required): Short summary of the issue
 * description: description of the issue, with a link back to the original report
 * attachments: include a list of multipart/form-data files to send
 * permittedGroup: sets the permissions in YouTrack for the issue
 */
youtrack.create = function (data) {
    restler.put(config.youtrack.url + '/rest/issue', {
        params: data
    }).on('complete', function (result, resp) {
        if (result instanceof Error) {
            console.error('Error creating issue in YouTrack');
            console.dir(result);
        } else {
            console.log('Created youtrack issue');
            console.dir(result);
            issues.insert(data, function (err, result) {
                console.log('Added ' + data.issueId + ' from ' + data.source + ' to mongo');
            });
        }
    })
};


/**
 * Update an issue from a remote source in Youtrack
 * @param {object} issue - Config option for the issue to update
 * @param {object} issue.issueId - ID of this issue from the original source
 * @param {object} issue.source - Source that originally created the issue
 * @param {object} issue.project - YouTrack project that contains this issue
 *
 * @param {string} command - YouTrack command to run on this issue.
 */
youtrack.update = function (issue, command) {
    issues.findOne(issue, function (err, dbIssue) {
        if (err || !dbIssue) {
            console.error('Unable to find YouTrack issue to update');
            console.dir(dbIssue);
            if (err) {
                console.dir(err);
            }
        } else {
            restler.post(config.youtrack.url + '/rest/issue/' + dbIssue.youtrackId + '/execute', {
                data: {command: command}
            }).on('complete', function (result) {
                if (result instanceof Error) {
                    console.error('Error updating issue in YouTrack');
                    console.dir(result);
                } else {
                    console.log('Updated youtrack issue ' + dbIssue.youtrackId);
                }
            })
        }
    });
};

module.exports = youtrack;