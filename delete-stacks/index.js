'use strict'
var AWS = require('aws-sdk');
var cloudFormation = new AWS.CloudFormation({
    apiVersion: '2010-05-15'
});

var stackStatus = ['CREATE_COMPLETE', 'CREATE_IN_PROGRESS', 'CREATE_FAILED', 'UPDATE_COMPLETE', 'DELETE_FAILED'];

exports.handler = (event, context, callback) => {
    console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    deleteStacks( (err) => {
        if(err) {
            console.log("Error: ", err);
            return;
        }
        console.log("Successful Delete");
        return;
    });
};

function deleteStacks(callback){
  var params = {
    StackStatusFilter: stackStatus,
  };

  cloudFormation.listStacks(params, function(err, data) {
    if (err) return callback(err);

    if (data.StackSummaries.length == 0) callback();

    /*params = {Bucket: bucketName};
    params.Delete = {Objects:[]};*/

    data.StackSummaries.forEach( (content) => {
      console.log("Deleting Stack: ", content.StackId);
      cloudFormation.deleteStack(
        { StackName: content.StackId },
        (err, data) => {
            if(err) {
                console.log("Error: ", err);
                return;
            }
            console.log("Stack Deleted: ", content.StackId);
        }
      );
    });
  });
}
