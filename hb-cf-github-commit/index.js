var AWS = require('aws-sdk');

var sns = new AWS.SNS({ region: 'us-east-1' });
var s3 = new AWS.S3({ region: 'us-east-1' });

var CONFIG, githubEvent;

exports.handler = function(event, context, callback){
    githubEvent = JSON.parse(event.Records[0].Sns.Message);    
    
    /*
    * if it's a commit event get the list of files that changed and their
    * location in the repository, then publish each file to SNS topic for 
    * further processing by another lambda function 
    */ 
    if (isCommitEvent(githubEvent)) {

        getConfigFile(context.functionName)
            .then(setConfig)
            .then(getFilesFromEvent)
            .then(publishFiles)
            .then(function(result) {
                console.log('Result from lambda function: ', result);
                context.done();
            })
            .catch(function(err) {
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

var getConfigFile = function getConfigFile(functionName){
    var params = {
        Bucket: 'sweet-skills-lambda-config/' + functionName,
        Key: 'properties.json'
    };
    return s3.getObject(params).promise();
}

var setConfig = function setConfig(configFile){
    return new Promise(function(resolve){
        var properties = configFile.Body.toString();
        CONFIG = JSON.parse(properties);
        resolve();
    });
}

var getFilesFromEvent = function getFilesFromEvent(){
    return new Promise(function(resolve){
        var repository = githubEvent.repository.full_name;
        var bucket = githubEvent.repository.name;
        
        var files = [];

        githubEvent.commits.forEach(function(commit){
            commit.modified.forEach(function(filePath){
                files.push(getFileInfo(filePath, bucket, repository));
            });
            commit.added.forEach(function(filePath){
                files.push(getFileInfo(filePath, bucket, repository));
            });
        });
        resolve(files);
    });
}

function getFileInfo(filePath, bucket, repository){
    return {
        bucket: bucket,
        path: `https://raw.githubusercontent.com/${repository}/master/${filePath}`,
        name: filePath.substr(filePath.lastIndexOf('/') + 1),
        folder: filePath.substr(0, filePath.lastIndexOf('/')),
        bucketPath: filePath
    };
}

var publishFiles = function publishFiles(files){
    return Promise.all(files.map(function(file){
        return publishFileInfo(file);
    }));
}

var publishFileInfo = function publishFileInfo(file){
    var params = {
        Message: JSON.stringify(file),
        TopicArn: CONFIG.saveToS3ARN
    };
    return sns.publish(params).promise();
}