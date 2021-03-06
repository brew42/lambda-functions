'use strict'
var AWS = require('aws-sdk');
var cloudFormation = new AWS.CloudFormation({
    apiVersion: '2010-05-15'
});
var camelcase = require('camelcase-keys');

var rootStackName = '';

exports.handler = (event, context, callback) => {
    
    rootStackName = '';//TODO get stackname from event

    getStacks()
        .then(convertToUIStacks)
        .then(filterByName)
        .then(nestStacks)
        .then((stacks) => {
            context.done(null, stacks);
        })
        .catch((err) => {
            context.done(err);
        });
};

var getStacks = () => {
    var params = {};
    return cloudFormation.describeStacks(params).promise();
};

var convertToUIStacks = (response) => {
    return new Promise( (resolve) => {
        resolve(response.Stacks.map(convertToUIStack));
    });
};

var filterByName = (stacks) => {
    return new Promise( (resolve) => {
        resolve(stacks.filter(matchesStackName));
    });
}

var nestStacks = (stacks) => {
    var rootStacks = [];
    var nestedStacks = [];
    return new Promise( (resolve) => {
        stacks.forEach( (stack) => {
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

function matchesStackName(stack) {
    return stack.stackName == stackName || isStackNestedInRootStack(stack, rootStackName);
}

function convertToUIStack(stack){
    var uiStack = camelcase(stack);
    uiStack.parameters = camelCaseItems(uiStack.parameters);
    uiStack.outputs = camelCaseItems(uiStack.outputs);
    uiStack.tags = camelCaseItems(uiStack.tags);

    uiStack.nestedStacks = [];
    delete uiStack.capabilities;
    delete uiStack.disableRollback;
    delete uiStack.notificationARNs;
    return uiStack;
}

function isNestedStack(stack){
    return getRootStackId(stack);
}

function getRootStackId(stack){
    var rootStackId;
    stack.tags.forEach( (tag) => {
        if( tag.key === 'rootStackId' ){
            rootStackId = tag.value;
        }
    });
    return rootStackId;
}

function addNestedToRoot(nested, rootStacks){
    var rootStackId = getRootStackId(nested);
    rootStacks.forEach( (rootStack) => {
        if( rootStack.stackId === rootStackId ){
            rootStack.nestedStacks.push(nested);
        }
    });
    return rootStacks;
}

function isStackNestedInRootStack(stack, rootStackName){
    var isNested = false;
    stack.tags.forEach( (tag) => {
        if( tag.key === 'rootStackId' && tag.value === rootStackName ){
            isNested = true;
        }
    });
    return isNested;
}

function camelCaseItems(items){
    var camelCased = [];
    items.forEach( (item) => {
        camelCased.push(camelcase(item));
    });
    return camelCased;
}

// cloudformation => sns/lambda => sms
// cloudformation => sns/lambda => upsert stack info in dynamodb
// s3 => api gateway/lambda => get from dynamodb

// or

// s3 => api gateway/lambda => aws cli query cloudformation