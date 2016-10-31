'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    
   getStickers()
        .then( stickers => context.done(null, stickers.Items) )
        .catch( err => {
            console.log('Unexpected error getting stickers: ', JSON.stringify(err));
            context.done('Unexpected error');
        });
};

var getStickers = () => {
    var params = {
        TableName: 'Sticker'
    };
    return docClient.scan(params).promise();
};