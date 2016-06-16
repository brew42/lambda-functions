var http = require('http');
var AWS = require('aws-sdk');
var GitHubApi = require('github');
var github = new GitHubApi({
    version: '3.0.0'
});

exports.handler = function(event, context, callback){
    const githubEvent = event.Records[0].Sns.Message;
    
    if (githubEvent.hasOwnProperty('pusher')) {

        var files = getFileInfoFromEvent(githubEvent);
        console.log('finished getting file infos', files);
        publishFiles(files, function(err, data){
            if(err){
                console.log(err, err.stack);
            } else {
                context.done();
            }
        });
    }
    context.done();
}

function getFileInfoFromEvent(githubEvent){

    var repository = githubEvent.repository.full_name;

    var files = [];

    githubEvent.commits.forEach(function(commit){
        commit.modified.forEach(function(filePath){
            console.log('getting info for file with path: ' + filePath);
            var fileInfo = {
                bucket: 'sweet-skills-cloud-formation-templates',
                path: `https://raw.githubusercontent.com/${repository}/master/{filePath}`,
                name: filePath.substr(filePath.lastIndexOf('/') + 1)
            }
            files.push(fileInfo);
        });
    });

    return files;
}

function publishFiles(files, callback){
    files.forEach(function(fileInfo){
        publishFileInfo(fileInfo);
    });
}

function publishFileInfo(file){
    var params = {
        Message: '',
        MessageAttributes: {
            key: {
                DataType: '',
                BinaryValue: new Buffer() || '',
                StringValue: ''
            }
        },
        MessageStructure: '',
        Subject: '',
        TargetArn: '',
        TopicArn: ''
    };
    sns.publish(params, function(err, data){
        if (err){
            console.log(err, err.stack);
        } else {
            console.log(data);
        }
    });
}