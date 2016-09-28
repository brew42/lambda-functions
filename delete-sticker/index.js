'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    
    deleteSticker(params.userId, params.stickerId)
        .then( sticker => context.done(null, { code: 200, message: 'Successfully deleted sticker' }))
        .catch( err => {
            console.log('Unexpected error adding sticker: ', JSON.stringify(err));
            context.done( { code: '500', message: 'Unexpected error' } )
        });
};

var deleteSticker = (userId, badgeIdProjectId) => {

    var params = {
        TableName: 'Sticker',
        Key: {
            userId: userId,
            badgeIdProjectId: badgeIdProjectId
        }
    };
    return docClient.delete(params).promise()
};