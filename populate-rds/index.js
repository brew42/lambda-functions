'use strict'

var response = require('response.js');
var AWS = require('aws-sdk');
var fs = require('fs');
var unzip = require('unzip');
var async = require('async');

exports.handler = function(event, context,callback) {

	console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    var responseData = {};
    var script = "./pgsql/bin/psql -f /tmp/sweetskills/create_master.sql --dbname=postgresql://";

    var DBMasterUserName = event.ResourceProperties.DBMasterUserName;
    var DBMasterPassword = event.ResourceProperties.DBMasterPassword;
    var DBAddress = event.ResourceProperties.DBAddress;
    var DBListeningPort = event.ResourceProperties.DBListeningPort;
    var DBName = event.ResourceProperties.DBName;
    
    script = script + DBMasterUserName + ":" + DBMasterPassword + "@" + DBAddress + ":" + DBListeningPort + "/" + DBName;

    const exec = require('child_process').exec;

    async.series([
        function download(downloadNext) {
            var s3 = new AWS.S3();
            s3.getObject({
                Bucket: "honey-badger-lambda-data",
                Key: "sweetskills.zip"
            }).createReadStream().pipe(fs.createWriteStream('/tmp/sweetskills.zip')).on('finish', function(err) {
                if (err) {
                    console.log('error download');
                    downloadNext(err);
                } else {
                    downloadNext(null);
                }
            });
        },
        function open(openNext) {
            fs.createReadStream('/tmp/sweetskills.zip').pipe(unzip.Extract({ path: '/tmp' }).on('close', function(err) {
                if (err) {
                    console.log('error open');
                    openNext(err);
                } else {
                    openNext(null);
                }
            }));
        },
        function execute3(executeNext) {
            const child3 = exec(script, (error, stdout, stderr) => {
                if (error) {
                    console.log("Error execute script");
                    console.log(error);
                    //response.send(event, context, response.FAILED, responseData);
                }
                console.log(stdout);
                console.log(stderr);
                executeNext(null);
            });
        },
        function respond(respondNext) {
            response.send(event, context, response.SUCCESS, responseData);
            respondNext(null);
        }
    ], function (error) {
        if (error) {
            console.log('Error- failed');
            console.log(error);
        }
    });
}





