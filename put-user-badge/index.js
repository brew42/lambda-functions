'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received upsert user badge request with params: ', event);
    
    saveUserBadge(params)
        .then( userBadge => context.done(null, userBadge))
        .catch( err => {
            console.log('Unexpected error adding user badge: ', JSON.stringify(err));
            context.done('Unexpected error');
        });
};

var saveUserBadge = (params) => {

    let userBadge = {
        userId: params.userId,
        badgeIdProjectId: params.badgeId + params.projectId,
        badgeId: params.badgeId,
        projectId: params.projectId,
        created: (new Date()).toString(),
    }

    var params = {
        TableName: 'UserBadge',
        Item: userBadge
    };
    // Can't use the aws .promise() response because dynamodb.put operation inexplicably doesn't support returning the put object
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) =>  err ? reject(err) : resolve(userBadge) );
    });
};