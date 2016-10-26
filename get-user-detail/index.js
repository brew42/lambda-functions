'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    let params = event;
    let id = params.userId;
    
    Promise.all([getUser(id), getUserBadges(id)])
        .then(addBadgesToUser)
        .then( user => context.done(null, user) )
        .catch( err => {
            console.log('Unexpected error getting user: ', JSON.stringify(err));
            context.done( { code: '500', message: 'Unexpected error' } );
        });
};

var getUser = (id) => {
    var params = {
        TableName: 'User',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
    };
    return docClient.query(params).promise();
};

var getUserBadges = (userId) => {
    var params = {
        TableName: 'UserBadge',
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': userId
        }
    };
    return docClient.query(params).promise();
};

var addBadgesToUser = (values) => {
    let users = values[0].Items;
    let userBadges = values[1].Items;
    console.log('Users:', users);
    console.log('User Badges:', userBadges);
    return doAddBadgesToUser(users, userBadges);
};

var doAddBadgesToUser = (users, userBadges) => {
    return new Promise( (resolve, reject) => {
        let user = users.length ? users[0] : reject('No users found with that ID');
        user.badges = userBadges;
        resolve(user);
    });
};