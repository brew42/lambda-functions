var AWS = require('aws-sdk');

var s3 = new AWS.S3({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => {
    var fileInfo = JSON.parse(event.Records[0].Sns.Message);
    
    deleteFile(fileInfo)
        .then(function(result) {
            console.log('Result from lambda function: ', result);
            context.done();
        })
        .catch(function(err) {
            console.log('Error from lambda function', err);
            context.done();
        });    
};

var deleteFile = function(fileInfo){
    var params = {
        Bucket: fileInfo.bucket,
        Key: fileInfo.folder + '/' + fileInfo.name
    };
    return s3.deleteObject(params).promise();
};