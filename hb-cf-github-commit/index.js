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
    if (isMasterCommitEvent(githubEvent)) {
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

function isMasterCommitEvent(event){
    return event.hasOwnProperty('pusher') && event.ref == 'refs/heads/master';
}

var getConfigFile = (functionName) => {
    let params = {
        Bucket: `honey-badger-lambda-config/${functionName}`,
        Key: 'properties.json'
    };
    return s3.getObject(params).promise();
}

var setConfig = (configFile) => {
    return new Promise((resolve) => {
        let properties = configFile.Body.toString();
        CONFIG = JSON.parse(properties);
        resolve();
    });
}

var getFiles = () => {
    return new Promise(function(resolve){
        let repository = githubEvent.repository.full_name;
        let bucket = githubEvent.repository.name;        
        
        let files = [];

        githubEvent.commits.map(commit => {
            commit.modified.map(filePath => {
                let remove = false;
                files.push(getFileInfo(filePath, bucket, repository, remove));
            });
            commit.added.map(filePath => {
                let remove = false;
                files.push(getFileInfo(filePath, bucket, repository, remove));
            });
            commit.removed.map(filePath => {
                let remove = true;
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
    
    let params = {
        Message: JSON.stringify(fileInfo),
        TopicArn: fileInfo.remove ? CONFIG.deleteFromS3ARN : CONFIG.saveToS3ARN
    };
    return sns.publish(params).promise();
}

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}