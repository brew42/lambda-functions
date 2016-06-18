'use strict'
var https = require('https');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => {
    var fileInfo = getSNSMessage(event);
    
    getFile(fileInfo)
        .then(saveFileToS3)
        .then( (result) => {
            console.log('Result from lambda function: ', result);
            context.done();
        })
        .catch( (err) => {
            console.log('Error from lambda function', err);
            context.done();
        });    
}

var getFile = (fileInfo) => {
    return new Promise(function(resolve, reject){
        var file = '';
        https.get(fileInfo.path, (res) => {

            res.on('data', (chunk) => {
                file += chunk;
            });

            res.on('end', () => {
                fileInfo.file = file;
                resolve(fileInfo);
            });

        }).on('error', (err) => { reject(err) });
    });
};

var saveFileToS3 = (fileInfo) => {
    var s3Params = {
        Bucket: fileInfo.bucket,
        Key: fileInfo.folder + '/' + fileInfo.name,
        Body: fileInfo.file,
    };
    return s3.putObject(s3Params).promise();
};

function getSNSMessage(event){
    return JSON.parse(event.Records[0].Sns.Message);
}