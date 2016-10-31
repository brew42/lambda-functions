'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    var object = getSNSMessage(event);
    
    console.log('Updating sticker for object:', object);
    
    getStickers()
        .then(stickerData => modifyStickers(stickerData, object))
        .then(updateSticker)
        .then( result => context.done(null, 'Successfully updated object sticker'))
        .catch( err => {
            console.log('Error from lambda function', err);
            context.done('Unexpected error');
        });
};

var getStickers = () => {
    var params = {
        TableName: 'Sticker'
    };
    return docClient.scan(params).promise();
};

var modifyStickers = (stickerData, object) => {
    let stickers = stickerData.Items;
    let sticker = stickers.find(s => s.type === object.id);
    console.log('Sticker', sticker);

    if (!sticker) {
        sticker = {
            id: generateUUID(),
            type: object.id
        };
    }
    sticker.fontSet = object.fontSet;
    sticker.icon = object.icon;
    sticker.name = object.name;
    sticker.description = object.description;
    console.log('Updated sticker', sticker);

    return new Promise( resolve => resolve(sticker) );
};

var updateSticker = (sticker) => {
    sticker.created = (new Date()).toString();
    var params = {
        TableName: 'Sticker',
        Item: sticker
    };
    return docClient.put(params).promise();
};

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}