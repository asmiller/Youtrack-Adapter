var express = require('express');
var issues = require('../issues');
var youtrack = require('../youtrack');
var restler = require('restler');
var cfg = require('../config').services.rollbar;
var router = express.Router();

var projects = {};

var auth = {query: {access_token: cfg.access_token}};


restler.get('https://api.rollbar.com/api/1/projects', auth).on('complete', function (data) {
    if (data instanceof Error) {
        console.error('Unable to log in to Rollbar to find projects');
        console.dir(data);
    } else {
        data.result.forEach(function (project) {
            if (project.name) {
                projects[project.id] = {
                    id: project.id,
                    name: project.name,
                    url: cfg.url + '/' + project.name + '/items',
                    youtrackProject: cfg.projects[project.name] || project.name
                };

                restler.get('https://api.rollbar.com/api/1/project/' + project.id + '/access_tokens', auth).on('complete', function (data) {
                    if (data.result) {
                        data.result.forEach(function (token) {
                            if (token.scopes.indexOf('read') !== -1 && token.status === 'enabled') {
                                projects[project.id].readToken = token.access_token;
                            }
                            if (token.scopes.indexOf('write') !== -1 && token.status === 'enabled') {
                                projects[project.id].writeToken = token.access_token;
                            }
                        });
                    }
                });
            }
        });

        console.log('Loaded ' + Object.keys(projects).length + ' projects from Rollbar');
    }
});


//Create an issue in YouTrack from a Rollbar exception
router.post('', function (req, res) {
    var event = req.body,
        item = event.data.item;

    //We aren't handling the 'deploy' events from rollbar
    if (item) {
        var project = projects[item.project_id];

        var itemKey = {
            issueId: item.id,
            project: project.youtrackProject,
            source: 'rollbar'
        };

        var itemDesc = {
            summary: item.title,
            description: 'Reporter: Rollbar (' + project.url + '/' + item.counter + ')\n'
        };

        try {
            itemDesc.description += item.last_occurrence.body.message.body;
        } catch (e) {

        }

        youtrack.exists(itemKey, function (exists) {
            if (!exists) {
                event.event_name = 'new_item';
            } else if (event.event_name === 'new_item') {
                event.event_name = 'exp_repeat_item';
            }

            switch (event.event_name) {
                case 'new_item':
                    youtrack.create(itemKey, itemDesc);
                    break;
                case 'exp_repeat_item':
                    youtrack.update(itemKey, {'comment': 'Total occurrences: ' + item.total_occurrences});
                    break;
                case 'resolved_item':
                    youtrack.update(itemKey, {state: 'Fixed'});
                    break;
                case 'reopened_item':
                case 'reactivated_item':
                    youtrack.update(itemKey, {state: 'Open', '&comment': 'Reopened by Rollbar'});
                    break;
            }
        });
    } else {
        console.log('Received unknown hook from Rollbar');
        console.dir(req.body);
    }

    res.sendStatus(200);
});

module.exports = router;
