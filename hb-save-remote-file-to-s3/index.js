var https = require('https');
var AWS = require('aws-sdk');

var s3 = new AWS.S3({
    region: 'us-east-1'
});

exports.handler = function(event, context, callback){
    var fileInfo = JSON.parse(event.Records[0].Sns.Message);
    
    getFileFromInfo(fileInfo)
        .then(saveFileToS3)
        .then(function(result) {
            console.log('Result from lambda function: ', result);
            context.done();
        })
        .catch(function(err) {
            console.log('Error from lambda function', err);
            context.done();
        });    
}

var getFileFromInfo = function(fileInfo){
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
}

var saveFileToS3 = function(fileInfo){
    var s3Params = {
        Bucket: fileInfo.bucket,
        Key: fileInfo.folder + '/' + fileInfo.name,
        Body: fileInfo.file,
    };
    return s3.putObject(s3Params).promise();
}