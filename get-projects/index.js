'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    
    getProjects()
        .then((projects) => {
            context.done(null, projects);
        })
        .catch((err) => {
            context.done(err);
        });
};

var getProjects = () => {
    var params = {
        TableName: "testthree-ProjectTable"
    };
    return docClient.scan(params).promise();
};