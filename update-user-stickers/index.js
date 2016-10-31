'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    var userBadge = getSNSMessage(event);
    
    console.log('Updating stickers from user badge:', userBadge);
    
    Promise.all([userBadge, getUserBadges(userBadge.userId), getStickers()])
        .then(modifyStickers)
        .then( result => context.done(null, 'Successfully updated user stickers'))
        .catch( err => {
            console.log('Error from lambda function', err);
            context.done('Unexpected error');
        });
};

var modifyStickers = (values) => {
    let userBadge = values[0];
    let userBadges = values[1].Items;
    let stickers = values[2].Items;
    console.log('User badge', userBadge);
    console.log('User badges', userBadges);
    console.log('Stickers', stickers);

    let userStickers = getUpdatedUserStickers(userBadge, userBadges, stickers);

    return Promise.all( userStickers.map( sticker => {
        return sticker.save ? saveUserSticker(sticker.sticker) : deleteUserSticker(sticker.sticker);
    }));
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

var getStickers = () => {
    var params = {
        TableName: 'Sticker'
    };
    return docClient.scan(params).promise();
};

var getUpdatedUserStickers = (userBadge, userBadges, stickers) => {
    let userStickers = [];

    let firstSticker = getFirstUserSticker(userBadge, userBadges, stickers);
    if (firstSticker.sticker) {
        userStickers.push(firstSticker);
    }

    let badgeSticker = getBadgeUserSticker(userBadge, userBadges, stickers);
    if (badgeSticker.sticker) {
        userStickers.push(badgeSticker);
    }

    let projectSticker = getProjectUserSticker(userBadge, userBadges, stickers);
    if (projectSticker.sticker) {
        userStickers.push(projectSticker);
    }

    return userStickers;
};

var getFirstUserSticker = (userBadge, userBadges, stickers) => {
    let type = 'first';
    return {
        sticker: getUserSticker(userBadge, stickers, type),
        save: userBadges.length > 0
    };
};

var getBadgeUserSticker = (userBadge, userBadges, stickers) => {
    let type = userBadge.badgeId;
    let badgeProjects = userBadges.filter(ub => ub.badgeId === userBadge.badgeId);

    return {
        sticker: getUserSticker(userBadge, stickers, type),
        save: badgeProjects.length > 4
    };
};

var getProjectUserSticker = (userBadge, userBadges, stickers) => {
    let type = userBadge.projectId;
    let projectBadges = userBadges.filter(ub => ub.projectId === userBadge.projectId);

    return {
        sticker: getUserSticker(userBadge, stickers, type),
        save: projectBadges.length > 12
    };
};

var getUserSticker = (userBadge, stickers, type) => {
    let userSticker = {};
    let sticker = stickers.find(s => s.type === type);

    if (sticker) {
        userSticker.userId = userBadge.userId;
        userSticker.stickerId = sticker.id;
    }
    return sticker ? userSticker : null;
};

var saveUserSticker = (userSticker) => {
    console.log('Saving user sticker', userSticker);
    userSticker.created = (new Date()).toString();
    var params = {
        TableName: 'UserSticker',
        Item: userSticker
    };
    return docClient.put(params).promise();
};

var deleteUserSticker = (userSticker) => {
    userSticker.created = (new Date()).toString();
    var params = {
        TableName: 'UserSticker',
        Key: {
            userId: userSticker.userId,
            stickerId: userSticker.stickerId
        }
    };
    return docClient.delete(params).promise();
};

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}