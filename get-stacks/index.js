'use strict'
var AWS = require('aws-sdk');
var cloudFormation = new AWS.CloudFormation({
    apiVersion: '2010-05-15'
});

exports.handler = (event, context, callback) => {
    
    describeStacks()
        .then(getRootStacks)
        .then((stacks) => {
            console.log("Got root stacks");
            console.log(JSON.stringify(stacks));
            context.succeed(stacks);
        })
        .catch((err) => {
            console.log('Error from lambda function', err);
            context.done();
        });
};

var describeStacks = () => {
    var params = {};
    return cloudFormation.describeStacks(params).promise();
};

var getRootStacks = (response) => {
    var rootStacks = [];
    var nestedStacks = [];
    return new Promise( (resolve) => {
        response.Stacks.forEach( (stack) => {
            if( isNestedStack(stack) ){
                nestedStacks.push(stack);
            } else {
                rootStacks.push(stack);
            }
        });
        nestedStacks.forEach( (nestedStack) => {
            rootStacks = addNestedToRoot(nestedStack, rootStacks);
        });
        resolve(rootStacks);
    });
};

function isNestedStack(stack){
    return getRootStackId(stack);
}

function getRootStackId(stack){
    var rootStackId;
    stack.Tags.forEach( (tag) => {
        if( tag.Key === 'parentStackId' ){
            rootStackId = tag.Value;
        }
    });
    return rootStackId;
}

function addNestedToRoot(nested, rootStacks){
    var rootStackId = getRootStackId(nested);
    rootStacks.forEach( (rootStack) => {
        if( rootStack.StackId === rootStackId ){
            if( !rootStack.NestedStacks ){
                rootStack.NestedStacks = [];
            }
            rootStack.NestedStacks.push(nested);
        }
    });
    return rootStacks;
}

// cloudformation => sns/lambda => sms
// cloudformation => sns/lambda => upsert stack info in dynamodb?
// s3 => api gateway/lambda => get from dynamodb?

// or

// s3 => api gateway/lambda => aws cli query cloudformation