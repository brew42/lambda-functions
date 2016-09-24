'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    
   getBadges()
        .then( badges => context.done(null, badges.Items) )
        .catch( err => context.done(err) );
};

var getBadges = () => {
    var params = {
        TableName: "Badge"
    };
    return docClient.scan(params).promise();
};