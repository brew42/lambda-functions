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

var getFileFromInfo = function getFileFromInfo(fileInfo){
    return new Promise(function(resolve, reject){
        console.log('getting file from url: ' + fileInfo.path);

        https.get(fileInfo.path, (res) => {

            var file = '';
            
            res.on('data', (chunk) => {
                file += chunk;
            });

            res.on('end', () => {
                file = JSON.parse(file.toString());
                console.log('got file: ', file);
                fileInfo.file = file;
                resolve(fileInfo);
            });

        }).on('error', (err) => {
            console.log('error getting file', err);
            reject(err)
        });
    })
}

var saveFileToS3 = function saveFileToS3(fileInfo){
    console.log('saving file: ', fileInfo);
    var s3Params = {
        Bucket: fileInfo.bucket,
        Key: (new Date()).getTime() + file.bucketPath,
        Body: fileInfo.file,
    };
    return new Promise(function(resolve, reject){
        console.log('Saving file ' + fileInfo.name + ' to S3 bucket: ' + fileInfo.bucket);
        
        // TODO use a package like https://www.npmjs.com/package/aws-sdk-then instead of callbacks
        s3.putObject(s3Params, function(err, data){
            if(err){
                console.log('error saving file', err);
                reject(err);
            } else {
                console.log('Successfully saved template to S3: ', data);
                resolve();
            }
        });
    });    
}