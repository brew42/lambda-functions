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

var getStickers = (userId) => {
    var params = {
        TableName: 'Sticker',
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': userId
        }
    };
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

        user.projects = [];
        projects.forEach( project => {
            project.badges = [];
            badges.forEach( badge => {
                let projectBadge = {
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    icon: badge.icon,
                    fontSet: badge.fontSet,
                    sticker: null
                };
                projectBadge.sticker = stickers.find( sticker => sticker.badgeId === badge.id && sticker.projectId === project.id );
                project.badges.push(projectBadge);
            });
            user.projects.push(project);
        });

        resolve(user);
    });
};