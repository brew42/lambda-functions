'use strict'
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => {
    var fileInfo = getSNSMessage(event);
    
    console.log('Deleting file:', fileInfo);
    
    deleteFile(fileInfo)
        .then((result) => {
            console.log('Result from lambda function: ', result);
            context.done();
        })
        .catch((err) => {
            console.log('Error from lambda function', err);
            context.done();
        });    
};

var deleteFile = (fileInfo) => {
    var params = {
        Bucket: fileInfo.bucket,
        Key: fileInfo.folder + '/' + fileInfo.name
    };
    return s3.deleteObject(params).promise();
};

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}