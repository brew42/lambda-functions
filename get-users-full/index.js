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
            console.log('Unexpected error getting users: ', JSON.stringify(err));
            context.done( { code: '500', message: 'Unexpected error' } );
        });
};

var getUsers = () => {
    var params = {
        TableName: "User"
    };
    return docClient.scan(params).promise();
};

var getStickers = () => {
    var params = {
        TableName: "Sticker"
    };
    return docClient.scan(params).promise();
};

var getBadges = () => {
    var params = {
        TableName: "Badge"
    };
    return docClient.scan(params).promise();
};

var getProjects = () => {
    var params = {
        TableName: "Project"
    };
    return docClient.scan(params).promise();
};

var nestObjects = (values) => {
    let users = values[0].Items;
    let stickers = values[1].Items;
    let badges = values[2].Items;
    let projects = values[3].Items;
    console.log('Users:', users);
    console.log('Stickers:', stickers);
    console.log('Badges:', badges);
    console.log('Projects:', projects);

    return addStickersToUsers(users, stickers, badges, projects);
};

var addStickersToUsers = (users, stickers, badges, projects) => {
    users.forEach( user => {
        user.stickers = [];
        badges.forEach( badge => {
            let userSticker = {
                badge: badge,
                projects: []
            };
            stickers
                .filter(sticker => sticker.userId === user.id && sticker.badgeId === badge.id)
                .forEach( sticker => {
                    userSticker.projects.push(projects.find(project => project.id === sticker.projectId));
                });
            user.stickers.push(userSticker);
        });
    });
    
    return new Promise( resolve => resolve(users) );
};