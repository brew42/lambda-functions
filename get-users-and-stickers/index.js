'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {
    
    Promise.all([getUsers(), getStickers(), getBadges(), getProjects()])
        .then(nestObjects)
        .then((users) => {
            context.done(null, users);
        })
        .catch((err) => {
            context.done(err);
        });
};

var getUsers = () => {
    var params = {
        TableName: "testthree-UserTable"
    };
    return docClient.scan(params).promise();
};

var getStickers = () => {
    var params = {
        TableName: "testthree-StickerTable"
    };
    return docClient.scan(params).promise();
};

var getBadges = () => {
    var params = {
        TableName: "testthree-BadgeTable"
    };
    return docClient.scan(params).promise();
};

var getProjects = () => {
    var params = {
        TableName: "testthree-ProjectTable"
    };
    return docClient.scan(params).promise();
};

var nestObjects = (values) => {
    let users = values[0].Items;
    let stickers = values[1].Items;
    let badges = values[2].Items;
    let projects = values[3].Items;

    return addBadgesToStickers(stickers, badges)
                .then( stickers => addProjectToStickers(stickers, projects) )
                .then( stickers => addStickersToUsers(users, stickers) )
};

var addBadgesToStickers = (stickers, badges) => {
    stickers.forEach( sticker => {
        let badge = badges.find( badge => badge.id === sticker.badgeId );
        delete sticker.badgeId;
        sticker.badge = badge;
    });
    return new Promise( resolve => resolve(stickers) );
};

var addProjectToStickers = (stickers, projects) => {
    stickers.forEach( sticker => {
        let project = projects.find( project => project.id === sticker.projectId );
        delete sticker.projectId;
        sticker.project = project;
    });
    return new Promise( resolve => resolve(stickers) );
};

var addStickersToUsers = (users, stickers) => {
    stickers.forEach( sticker => {
        let user = users.find( user => user.id === sticker.userId );
        delete sticker.userId;
        if(!user.stickers){
            user.stickers = [];
        }
        user.stickers.push(sticker);
    });
    return new Promise( resolve => resolve(users) );
};