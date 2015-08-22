var restler = require('restler');
var config = require('./config.json');
var xml2json = require('xml2js').parseString;
var q = require('Q');
var issues = require('./issues');
var auth;

var youtrack = {};


//Log in to YouTrack
restler.post(config.youtrack.url + '/rest/user/login', {
    data: {
        login: config.youtrack.user,
        password: config.youtrack.pass
    }
}).on('complete', function (data, respObj) {
    if (data instanceof Error || !respObj.headers['set-cookie']) {
        console.error('Error logging in to YouTrack');
        console.dir(data);
    } else {
        console.log('Logged in to YouTrack with username ' + config.youtrack.user);
        auth = respObj.headers['set-cookie'].join(';');
    }
});


/**
 * Create a new issue in YouTrack. The data parameter must follow the following protocol:
 *
 * @param {object} key - Config option for the issue to update
 * @param {String} key.issueId - ID of this issue from the original source
 * @param {String} key.source - Source that originally created the issue
 * @param {String} key.project - YouTrack project that contains this issue
 *
 * @param {Object} data - Data for the issue
 * @param {String} data.summary - Short summary (title) of the issue
 * @param {String} data.description - Description of the issue
 * @param {String} data.permittedGroup - optional group for Youtrack visibility
 */
youtrack.create = function (key, data) {
    console.log(config.youtrack.url);

    data.project = key.project;

    restler.put(config.youtrack.url + '/rest/issue', {
        query: data,
        headers: {Cookie: auth}
    }).on('complete', function (result, resp) {

        if (result instanceof Error || result.error) {
            console.error('Error creating issue in YouTrack');
            console.dir(result);
        } else {
            key.youtrackId = resp.headers.location.split('/').pop();
            console.log('Created youtrack issue ' + key.youtrackId);

            issues.insert(key, function (err, result) {
                console.log('Added ' + key.issueId + ' from ' + key.source + ' to mongo');
            });
        }
    })
};


/**
 * Update an issue from a remote source in Youtrack
 * @param {object} key - Config option for the issue to update
 * @param {String} key.issueId - ID of this issue from the original source
 * @param {String} key.source - Source that originally created the issue
 * @param {String} key.project - YouTrack project that contains this issue
 *
 * @param {string|Object} command - YouTrack command to run on this issue. If string, run the command. If object, update each field to corresponding value.
 */
youtrack.update = function (key, command) {
    issues.findOne(key, function (err, dbIssue) {
        if (err || !dbIssue) {
            console.error('Unable to find YouTrack issue to update');
            console.dir(dbIssue);
            if (err) {
                console.dir(err);
            }
        } else {

            var cmd = '';
            if (command instanceof Object) {
                Object.keys(command).forEach(function (prop) {
                    cmd += prop + ' ' + command[prop] + ' ';
                });
            } else {
                cmd = command;
            }

            console.log('Running "' + cmd + ' on ' + dbIssue.youtrackId);

            restler.post(config.youtrack.url + '/rest/issue/' + dbIssue.youtrackId + '/execute', {
                data: {command: cmd},
                headers: {Cookie: auth}
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