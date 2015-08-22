var restler = require('restler');
var config = require('./config.json');
var xml2json = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;
var q = require('Q');
var db;
var token;
var collection;

var youtrack = {};

MongoClient.connect(config.dbUrl, function (err, database) {
    if (err) {
        console.error('Unable to connect to mongo');
        console.dir(err);
    } else {
        db = database;
        collection = db.collection('issues');
    }
});

//Log in to YouTrack
reslter.post(config.youtrack.url + '/rest/user/login', {
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
    restler.put(config.youtrackBase + '/rest/issue', {
        params: data
    }).on('complete', function (result) {
        if (result instanceof Error) {
            console.error('Error creating issue in YouTrack');
            console.dir(result);
        } else {
            collection.insert(data, function (err, result) {
                console.log('Added ' + issueId + ' from ' + source + ' to local DB');
            });
        }
    })
};

youtrack.update = function (issueId, source, project, data) {

    collection.find({issueId: issueId, source: source, project: project}).toArray(function (err, issues) {
        if (err || issues.length === 0) {
            console.error('Unable to find YouTrack issue to update');
            if (err) {
                console.dir(err);
            }
        } else {

        }
    });

};

module.exports = youtrack;