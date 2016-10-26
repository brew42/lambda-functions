'use strict'
var AWS = require('aws-sdk');
var sns = new AWS.SNS({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received upsert badge request with params: ', event);
    
    saveBadge(params)
        .then(publishSavedBadge)
        .then( badge => context.done(null, badge))
        .catch( err => {
            console.log('Unexpected error adding badge: ', JSON.stringify(err));
            context.done('Unexpected error')
        });
};

var saveBadge = (badge) => {

    badge.id = badge.id ? badge.id : generateUUID();
    badge.created = (new Date()).toString();

    var params = {
        TableName: "Badge",
        Item: replaceEmptyWithNull(badge)
    };
    // Can't use the aws .promise() response because dynamodb.put operation inexplicably doesn't support returning the put object
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) =>  err ? reject(err) : resolve(badge) );
    });
};

var publishSavedBadge = (badge) => {
    let params = {
        Message: JSON.stringify(badge),
        TopicArn: 'arn:aws:sns:us-east-1:207377804245:BadgeUpdated'
    };
    return new Promise( (resolve, reject) => {
        sns.publish(params, (err, data) => err ? reject(err) : resolve(badge) );
    });
};

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function replaceEmptyWithNull(object) {
    Object.getOwnPropertyNames(object).forEach( prop => {
        if (object[prop] === '') {
            object[prop] = null;
        }
    });
    return object;
}