var AWS = require('aws-sdk');

// Check if environment supports native promises
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}

var s3 = new AWS.S3({
    region: 'us-east-1'
});

exports.handler = function(event, context, callback){
    var fileInfo = event.fileInfo;
    
    getFileFromInfo(file, function(err, file){
        if(err){
            console.log(err, err.stacktrace);
            context.done();
        } else {
            saveFileInS3(file, function(err, data){
                if(err){
                    console.log(err, err.stacktrace);
                    context.done();
                } else {
                    context.done();
                }
            });
        }
    });
    
}

function getFile(fileInfo, callback){
    http.get(file.path, function(err, file){
        if(err){
            console.log('Error getting the file from github');
            console.log(err, err.stackrace);
            callback(err);
        } else {
            fileInfo.file = file;
            callback(null, fileInfo);
        }
    });
}

function saveFileInS3(file, callback){
    var s3Params = {
        Bucket: file.bucket,
        Key: (new Date()).getTime() + file.name,
        Body: file.file,
    };

    console.log('Saving file ' + event.file.name + ' to S3 bucket: ' + event.bucket);
    
    // TODO use a package like https://www.npmjs.com/package/aws-sdk-then instead of callbacks
    s3.upload(s3Params, function(err, data){
        if(err){
            console.log(err, err.stack);
            callback(err);
        } else {
            console.log('Successfully saved template to S3: ', data);
            callback(data);
        }
    });
}