'use strict'
var AWS = require('aws-sdk');
var sns = new AWS.SNS({ region: 'us-east-1' });
var s3 = new AWS.S3({ region: 'us-east-1' });

var CONFIG, cfMessage = {};

exports.handler = (event, context, callback) => {
    cfMessage = getMessage(event);
    
    /*
    * Only interested in sending notifications for complete or fail events
    */
    if (isStackEventCompleted(cfMessage)) {
        console.log('Received a CloudFormation stack completed event notification: ', cfMessage);
        
        getConfigFile(context.functionName)
            .then(setConfig)
            .then(createTextMessage)
            .then(publishTextMessage)
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

function isStackEventCompleted(event){
    return ( event.LogicalResourceId == event.StackName )
        && ( event.ResourceStatus == 'CREATE_COMPLETE' || event.ResourceStatus == 'CREATE_FAILED'
            || event.ResourceStatus == 'DELETE_COMPLETE' || event.ResourceStatus == 'DELETE_FAILED');
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

var createTextMessage = () => {
    return new Promise(function(resolve){
        var textMessage = cfMessage.StackName + ' has a status of ' + cfMessage.ResourceStatus;
        resolve(textMessage);
    });
}

var publishTextMessage = (textMessage) => {
    console.log('Publishing text message: ', textMessage);
    
    let params = {
        Message: textMessage,
        TopicArn: CONFIG.textNotification
    };
    return sns.publish(params).promise();
}

function getMessage(event){
    var message = {};

    var cloudFormationWorthlessFormatting = event.Records[0].Sns.Message;
    var worthlessMessages = cloudFormationWorthlessFormatting.split('\n');
    worthlessMessages.forEach( (worthlessMessage) => {
        var keyValue = worthlessMessage.split('=');
        if(keyValue.length == 2){
            keyValue[1] = keyValue[1].replace(/'/g,'');
            message[keyValue[0]] = keyValue[1];
        }
    });
    return message;
}