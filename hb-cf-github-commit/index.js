'use strict'
var AWS = require('aws-sdk');
var sns = new AWS.SNS({ region: 'us-east-1' });
var s3 = new AWS.S3({ region: 'us-east-1' });

var CONFIG, githubEvent;

exports.handler = (event, context, callback) => {
    githubEvent = getSNSMessage(event);    
    
    /*
    * if it's a commit event get the list of files that changed and their
    * location in the repository, then publish each file to SNS topic for 
    * further processing by another lambda function 
    */ 
    if (isCommitEvent(githubEvent)) {
        console.log('Received a GitHub commit notification: ', githubEvent);
        
        getConfigFile(context.functionName)
            .then(setConfig)
            .then(getFiles)
            .then(publishFiles)
            .then((result) => {
                console.log('Result from lambda function: ', result);
                context.done();
            })
            .catch((err) => {
                console.log('Error from lambda function', err);
                context.done();
            });

    } else {
        context.done();
    }
}

function isCommitEvent(event){
    return event.hasOwnProperty('pusher');
}

var getConfigFile = (functionName) => {
    var params = {
        Bucket: 'honey-badger-lambda-config/' + functionName,
        Key: 'properties.json'
    };
    return s3.getObject(params).promise();
}

var setConfig = (configFile) => {
    return new Promise((resolve) => {
        var properties = configFile.Body.toString();
        CONFIG = JSON.parse(properties);
        resolve();
    });
}

var getFiles = () => {
    return new Promise(function(resolve){
        var repository = githubEvent.repository.full_name;
        var bucket = githubEvent.repository.name;
        
        var files = [];

        githubEvent.commits.forEach(function(commit){
            commit.modified.forEach(function(filePath){
                var remove = false;
                files.push(getFileInfo(filePath, bucket, repository, remove));
            });
            commit.added.forEach(function(filePath){
                var remove = false;
                files.push(getFileInfo(filePath, bucket, repository, remove));
            });
            commit.removed.forEach(function(filePath){
                var remove = true;
                files.push(getFileInfo(filePath, bucket, repository, remove));
            });
        });
        resolve(files);
    });
}

function getFileInfo(filePath, bucket, repository, remove){
    return {
        bucket: bucket,
        path: `https://raw.githubusercontent.com/${repository}/master/${filePath}`,
        name: filePath.substr(filePath.lastIndexOf('/') + 1),
        folder: filePath.substr(0, filePath.lastIndexOf('/')),
        bucketPath: filePath,
        remove: remove
    };
}

var publishFiles = (files) => {
    return Promise.all( files.map( (file) => publishFileInfo(file) ) );
}

var publishFileInfo = (fileInfo) => {
    console.log('Publishing info for file: ', fileInfo);
    
    var params = {
        Message: JSON.stringify(fileInfo),
        TopicArn: fileInfo.remove ? CONFIG.deleteFromS3ARN : CONFIG.saveToS3ARN
    };
    return sns.publish(params).promise();
}

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}