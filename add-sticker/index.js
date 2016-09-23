'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    // TODO get request params from call 
    let params = {
        userId: 'user12345',
        projectId: 'project12345',
        badgeId: 'badge67890'
    }
    
    saveSticker(params)
        .then(() => {
            context.done(null);
        })
        .catch((err) => {
            context.done(err);
        });
};

var saveSticker = (sticker) => {
    sticker.id = generateUUID();
    sticker.badgeIdProjectId = sticker.badgeId + sticker.projectId;
    var params = {
        TableName: "testthree-StickerTable",
        Item: sticker,
        ConditionExpression: "(attribute_not_exists(projectId)) and (attribute_not_exists(badgeId))"
    };
    return docClient.put(params).promise();
};

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}