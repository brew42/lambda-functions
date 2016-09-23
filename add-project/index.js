'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    console.log('Received create project request with params: ', event);
    
    saveProject(params)
        .then(() => {
            context.done(null, { message: "Project created successfully" });
        })
        .catch((err) => {
            context.done(err);
        });
};

var saveProject = (project) => {

    project.id = generateUUID();
    project.created = (new Date()).toString();

    var params = {
        TableName: "testthree-ProjectTable",
        Item: project
    };
    return docClient.put(params).promise();
};

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}