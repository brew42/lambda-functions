'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    
    Promise.all([getUsers(), getUserStickers(), getStickers(), getUserBadges()])
        .then(nestObjects)
        .then((users) => {
            context.done(null, users);
        })
        .catch((err) => {
            console.log('Unexpected error getting users: ', JSON.stringify(err));
            context.done('Unexpected error');
        });
};

var getUsers = () => {
    var params = {
        TableName: 'User'
    };
    return docClient.scan(params).promise();
};

var getUserStickers = () => {
    var params = {
        TableName: 'UserSticker'
    };
    return docClient.scan(params).promise();
};

var getStickers = () => {
    var params = {
        TableName: 'Sticker'
    };
    return docClient.scan(params).promise();
};

var getUserBadges = () => {
    var params = {
        TableName: 'UserBadge',
    };
    return docClient.scan(params).promise();
};

var nestObjects = (values) => {
    let users = values[0].Items;
    let userStickers = values[1].Items;
    let stickers = values[2].Items;
    let userBadges = values[3].Items;
    console.log('Users:', users);
    console.log('User stickers:', userStickers);
    console.log('Stickers:', stickers);
    console.log('User badges:', userBadges);

    return addStickersAndBadgesToUsers(users, userStickers, stickers, userBadges);
};

var addStickersAndBadgesToUsers = (users, userStickers, stickers, userBadges) => {
    users.forEach( user => {
        user.stickers = [];
        userStickers.filter(us => us.userId === user.id).forEach( us => {
            let sticker = stickers.find(s => s.id === us.stickerId);
            user.stickers.push(sticker);
        });
        user.badges = userBadges.filter(ub => ub.userId === user.id);
    });
    
    return new Promise( resolve => resolve(users) );
};