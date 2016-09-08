'use strict'
var response = require('response.js');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({ 
    region: 'us-east-1',
    apiVersion: '2006-03-01' 
    });

exports.handler = (event, context, callback) => {

    console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    if (event.RequestType == 'Delete') {
        emptyBucket(event.ResourceProperties.BucketName, (err) => {
            if(err) {
                console.log("error: ", err);
                response.send(event, context, response.FAILED);
            }
            else {
              response.send(event, context, response.SUCCESS);
            }
        });
    }
    else { 
        response.send(event, context, response.SUCCESS);
        return;
    }  
};


function emptyBucket(bucketName,callback){
  var params = {
    Bucket: bucketName,
  };

  s3.listObjects(params, function(err, data) {
    if (err) return callback(err);

    if (data.Contents.length == 0) callback();

    params = {Bucket: bucketName};
    params.Delete = {Objects:[]};

    data.Contents.forEach(function(content) {
      params.Delete.Objects.push({Key: content.Key});
    });

    s3.deleteObjects(params, function(err, data) {
      if (err) return callback(err);
      if(data.Deleted.length == 1000)emptyBucket(bucketName,callback);
      else callback();
    });
  });
}