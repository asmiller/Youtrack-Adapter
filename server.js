var express = require('express');
var app = express();
var config = require('./config.json');
var restler = require('restler');
var youtrack = require('./youtrack');
var fs = require('fs');

var bodyParser = require('body-parser');


var services = {};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Load services
fs.readdirSync(__dirname + '/services').forEach(function (file) {
    if (file.indexOf('.js')) {
        var serviceName = file.split('.')[0];
        if (config.services[serviceName].enabled) {
            services[serviceName] = require(__dirname + '/services/' + file);

            app.use('/' + serviceName, services[serviceName]);
            console.log('Listening for ' + serviceName);
        }
    }
});

app.get('', function (req, res) {
    res.send('Post to /issues');
});

function create(obj) {
    var key = {
        issueId: obj.issueId,
        project: obj.project,
        source: 'local'
    };

    var data = {
        description: obj.description,
        summary: obj.summary
    };

    console.dir(key);
    console.dir(data);

    youtrack.create(key, data);
}

app.post('/issues', function (req, res) {
    if ((req.form || {}).issueId) {
        create(req.form);
    } else if ((req.body || {}).issueId) {
        create(req.body);
    } else if ((req.query || {}).issueId) {
        create(req.query);
    } else {
        return res.sendStatus(400);
    }

    res.sendStatus(200);
});

////Load existing YouTrack issues, so we can link them to Rollbar.
////TODO - This probably will not scale for YouTrack instances with 5k+ issues.
//Object.keys(config.youtrackProjects).forEach(function (project) {
//    restler.get(config.youtrack + '/rest/export/' + project + '/issues', {params: {max: '9999999999'}})
//        .on('complete', function (data) {
//            if (data instanceof Error) {
//                console.error('Unable to get youtrack issues for ' + project);
//                console.dir(data);
//            } else {
//                var issues = xml2json(data, function (err, results) {
//                    if (err) {
//                        console.error('Error converting YouTrack export to json');
//                        console.dir(err);
//                    } else {
//                        results.forEach(function (issue) {
//                            issue.description.split('\n').forEach(function (line) {
//                                if (line.indexOf('Rollbar ID:') === 0) {
//                                    issueForRollbarId[line.split(':')[1].trim()] = issue.
//                                }
//                            })
//                        });
//                    }
//                });
//            }
//        });
//});


var server = app.listen(config.port || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
});