'use strict'
var AWS = require('aws-sdk');
var codePipeline = new AWS.CodePipeline();

exports.handler = (event, context, callback) => {
    console.log('Started');

    var job = event['CodePipeline.job'];
    var jobData = event['CodePipeline.job'].data;
    var jobId = event['CodePipeline.job'].id;

    console.log('job', job);
    console.log('pipeline data', jobData);
    console.log('job id', jobId);

    var pipelineParams = {
        jobId: jobId,
        currentRevision: {
            changeIdentifier: '',//TODO what is this?
            revision: ''//TODO what is this?
        }
    };

    codePipeline
        .putJobSuccessResult(pipelineParams, function(err, data){
            console.log('Err', err);
            console.log('Data', data);
            console.log('Done2');
            context.done('Done done done');
        });
        // .promise()
        // .then( () => {
        //     console.log('Done');
        //     context.done('Done done done');
        // });
}