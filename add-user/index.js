'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received create user request with params: ', event);
    
    saveUser(params)
        .then(() => {
            context.done(null, { message: "User created successfully" });
        })
        .catch((err) => {
            context.done(err);
        });
};

var saveUser = (user) => {

    user.id = generateUUID();
    user.created = (new Date()).toString();

    var params = {
        TableName: "User",
        Item: user
    };
    return docClient.put(params).promise();
};

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}