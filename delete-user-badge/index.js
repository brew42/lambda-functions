'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    
    deleteUserBadge(params)
        .then( sticker => context.done(null, { code: 200, message: 'Successfully deleted user badge' }))
        .catch( err => {
            console.log('Unexpected error deleting user badge: ', JSON.stringify(err));
            context.done('Unexpected error')
        });
};

var deleteUserBadge = (params) => {

    var params = {
        TableName: 'UserBadge',
        Key: {
            userId: params.userId,
            badgeIdProjectId: params.badgeId + params.projectId
        }
    };
    return docClient.delete(params).promise()
};