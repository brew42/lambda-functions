'use strict'
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda({
    apiVersion: '2015-03-31'
});
var cloudFormation = new AWS.CloudFormation({
    apiVersion: '2010-05-15'
});
// var s3 = new AWS.S3({
//     region: 'us-east-1',
//     apiVersion: '2006-03-01'
// });

exports.handler = (event, context, callback) => {
    
    //TODO get trigger - daily or weekend destroy

    getAllStacks()
        .then(filterStacksToDestroy)
        .then(destroyStacks)
        .then((result) => {
            console.log('Result from lambda function: ', result);
            context.done();
        })
        .catch((err) => {
            console.log('Error from lambda function', err);
            context.done();
        });    
};

var getAllStacks = () => {
    var params = {
        FunctionName: 'get-stacks'
    };
    return lambda.invoke(params).promise();
};

var filterStacksToDestroy = (stacks) => {
    return new Promise( (resolve) => {
        // only return app hosting stacks not code pipeline, jenkins, etc
        // only return stacks with an autodelete that matches the trigger
        var filtered = stacks.filter((stack) => {
            return stack;
        });
        resolve(filtered);
    });
};

var destroyStacks = (stacks) => {
    return Promise.all(stacks.map(destroyStack));
}

var destroyStack = (stack) => {
    var params = {
        StackName: stack.stackName
    };
    return cloudformation.deleteStack(params).promise();
}

// var emptySiteBuckets = (stacks) => {
//     return new Promise( (resolve) => {
//         Promise.all( stacks.map( (stack) => emptySiteBucket(stack) ))
//             .then( () => { resolve(stacks) });
//     })
//     // return Promise.all( stacks.map( (stack) => emptySiteBucket(stack) ));
// };

// var emptySiteBucket = (stack) => {
//     return getBucketObjects(stack).then(deleteBucketObjects);
// };

// var getBucketObjects = (stack) => {
//     var params = {
//         Bucket: ''
//     }
//     return s3.listObjectsV2(params).promise();
// };

// var deleteBucketObjects = (bucketData) => {
//     var objects = bucketData.Contents.map( (object) => {
//         return { Key: object.key }
//     });
//     var params = {
//         Bucket: bucketData.Name,
//         Delete: {
//             Objects: objects
//         }
//     }
//     return s3.deleteObjects(params).promise();
// }