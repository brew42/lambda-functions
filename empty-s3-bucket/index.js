'use strict'
var response = require('./response.js');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
    region: 'us-east-1'
});

var globalBucketName = '';

exports.handler = (event, context, callback) => {

    console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    if (event.RequestType == 'Delete') {
      globalBucketName = event.ResourceProperties.BucketName;

      getObjects()
        .then((data) => {
            emptyBucket(data);
        })
        .then(function () {
          response.send(event, context, response.SUCCESS);
          return;
        })
        .catch(function(err) {
          return;
          console.log(err);
        });
    }
    else { 
        response.send(event, context, response.SUCCESS);
        return;
    }  
};

function getObjects(){
  var params = {
    Bucket: globalBucketName,
  };
  console.log("Bucket: ", params.Bucket);
  return s3.listObjectsV2(params).promise();
}

function emptyBucket(data){
  var params = {Bucket: globalBucketName};
  params.Delete = {Objects:[]};

  data.Contents.forEach(function(content) {
    console.log("Deleting Object: ", content.Key);
    params.Delete.Objects.push({Key: content.Key});
  });

  return s3.deleteObjects(params).promise();
}


