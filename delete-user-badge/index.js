'use strict'
var AWS = require('aws-sdk');
var sns = new AWS.SNS({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    
    deleteUserBadge(params)
        .then(publishDeletedUserBadge)
        .then( sticker => context.done(null, 'Successfully deleted user badge' ))
        .catch( err => {
            console.log('Unexpected error deleting user badge: ', JSON.stringify(err));
            context.done('Unexpected error')
        });
};

var deleteUserBadge = (params) => {

    let tableParams = {
        TableName: 'UserBadge',
        Key: {
            userId: params.userId,
            badgeIdProjectId: params.badgeId + params.projectId
        }
    };
    return new Promise( (resolve, reject) => {
        docClient.delete(tableParams, (err, data) =>  err ? reject(err) : resolve(params) );
    });
};

var publishDeletedUserBadge = (userBadge) => {
    let params = {
        Message: JSON.stringify(userBadge),
        TopicArn: 'arn:aws:sns:us-east-1:207377804245:UserBadgeRemoved'
    };
    return new Promise( (resolve, reject) => {
        sns.publish(params, (err, data) => err ? reject(err) : resolve(userBadge) );
    });
};