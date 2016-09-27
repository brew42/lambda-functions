'use strict'
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
});

exports.handler = (event, context, callback) => {

    console.log(event);
    console.log(context);
    // TODO get user id from call
    let id = 'b2043b0f-ea0d-434d-99a6-2afae63d9e77';
    
    Promise.all([getUser(id), getStickers(id), getBadges(), getProjects()])
        .then(nestObjects)
        .then( users => context.done(null, users) )
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
    console.log('getting user');
    return docClient.query(params).promise();
};

var getStickers = (userId) => {
    var params = {
        TableName: 'Sticker',
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': userId
        }
    };
    console.log('getting stickers');
    return docClient.query(params).promise();
};

var getBadges = () => {
    var params = {
        TableName: 'Badge'
    };
    return docClient.scan(params).promise();
};

var getProjects = () => {
    var params = {
        TableName: 'Project'
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
    return new Promise( (resolve, reject) => {
        let user = users.length ? users[0] : reject('No users found with that ID');
        
        let userStickers = [];
        badges.forEach( badge => {
            let userSticker = {
                badge: badge
            };
            stickers
                .filter(sticker => sticker.userId === user.id && sticker.badgeId === badge.id)
                .forEach( sticker => {
                    let project = projects.find(project => project.id === sticker.projectId);
                    userSticker.projectId = project ? project.id : undefined;
                });
            userStickers.push(userSticker);
        });
        
        user.projects = [];
        projects.forEach( project => {
            project.stickers = [];
            let sticker = userStickers.find( sticker => sticker.projectId === project.id );
            if(sticker){
                project.stickers.push(sticker);
            }
            user.projects.push(project);
        });
        console.log('Nested user:', user);
        resolve(user);
    });
};