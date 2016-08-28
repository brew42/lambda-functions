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

var trigger;

exports.handler = (event, context, callback) => {

    console.log('cloudwatch event', event);
    trigger = event.schedule.toUpperCase();

    getAllStacks()
        .then(responseToJson)
        .then(filterStacksByDestroyPolicy)
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
        FunctionName: 'GetStacks'
    };
    return lambda.invoke(params).promise();
};

var responseToJson = (response) => {
    return new Promise( (resolve) => {
        var stacks = JSON.parse(response.Payload);
        resolve(stacks);
    });
};

var filterStacksByDestroyPolicy = (stacks) => {
    return new Promise( (resolve) => {
        var filtered = stacks.filter((stack) => {
            return stackDestroyPolicyMatchesTrigger(stack);
        });
        resolve(filtered);
    });
};

var stackDestroyPolicyMatchesTrigger = (stack) => {
    var stackDestroyPolicy = stack.outputs.find( (output) => {
        return output.outputKey.toUpperCase() === 'AUTODESTROYPOLICY';
    });
    return stackDestroyPolicy && stackDestroyPolicy.outputValue.toUpperCase() === trigger;
}

var destroyStacks = (stacks) => {
    return Promise.all(stacks.map(destroyStack));
}

var destroyStack = (stack) => {
    var params = {
        StackName: stack.stackName
    };
    console.log('destroy this stack', params);
    return cloudFormation.deleteStack(params).promise();
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