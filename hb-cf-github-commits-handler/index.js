var http = require('http');
var AWS = require('aws-sdk');

// Check if environment supports native promises
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}

var sns = new AWS.SNS({
    region: 'us-east-1'
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
    var bucket = githubEvent.repository.name;

    var files = [];

    githubEvent.commits.forEach(function(commit){
        commit.modified.forEach(function(filePath){
            console.log('getting info for file with path: ' + filePath);
            var fileInfo = {
                bucket: bucket,
                path: `https://raw.githubusercontent.com/${repository}/master/{filePath}`,
                name: filePath.substr(filePath.lastIndexOf('/') + 1)
            }
            files.push(fileInfo);
        });
    });

    return files;
}

var publishFiles = function publishFiles(files){
    return Promise.all(files.forEach(publishFileInfo));
}

function publishFileInfo(file){
    var params = {
        Message: JSON.stringify(file),
        TopicArn: ''
    };
    return sns.publish(params).promise();
}