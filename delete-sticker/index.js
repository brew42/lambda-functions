'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received delete sticker request with params: ', event);
    params = {
        userId: 'b2043b0f-ea0d-434d-99a6-2afae63d9e77',
        badgeIdProjectId: '05ddff7c-09ff-4ce2-a6fd-25f30888e37a204bdc39-4e07-4366-a7fc-47290c914fe1'
    };
    
    deleteSticker(params.userId, params.badgeIdProjectId)
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