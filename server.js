var express = require('express');
var app = express();
var config = require('./config.json');
var restler = require('restler');
var youtrack = require('./youtrack');


//Create an issue in YouTrack from a Rollbar exception
app.post('youtrack/issues', function (req, res) {
    var event = req.body,
        item = event.data.item;

    //We aren't handling the 'deploy' events from rollbar
    if (item) {
        switch (event.event_name) {
            case 'new_item':
                youtrack.create(item);
                break;
            case 'reactivated_item':
                youtrack.update(item.id, {});
                break;
            case 'resolved_item':

                break;
            case 'reopened_item':

                break;
        }
    }

    res.send(200);
});

app.put('rollbar/issues', function (req, res) {
    res.send('Hello World!');
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


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
});