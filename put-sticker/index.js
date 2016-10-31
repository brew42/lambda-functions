'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received upsert sticker request with params: ', event);
    
    saveSticker(params)
        .then( sticker => context.done(null, sticker))
        .catch( err => {
            console.log('Unexpected error adding sticker: ', JSON.stringify(err));
            context.done('Unexpected error')
        });
};

var saveSticker = (sticker) => {

    sticker.id = sticker.id ? sticker.id : generateUUID();
    sticker.created = (new Date()).toString();

    var params = {
        TableName: 'Sticker',
        Item: replaceEmptyWithNull(sticker)
    };
    // Can't use the aws .promise() response because dynamodb.put operation inexplicably doesn't support returning the put object
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) =>  err ? reject(err) : resolve(sticker) );
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