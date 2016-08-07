'use strict'

var response = require('response.js');
var AWS = require('aws-sdk');
var fs = require('fs');
var unzip = require('unzip');
var async = require('async');

var script = "./pgsql/bin/psql -f /tmp/sweetskills/create_master.sql --dbname=postgresql://";

exports.handler = (event, context,callback) => {

	console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    if (event.RequestType == 'Delete') {
        response.send(event, context, response.SUCCESS);
        return;
    }

    var responseData = {};
    var DBMasterUserName = event.ResourceProperties.DBMasterUserName;
    var DBMasterPassword = event.ResourceProperties.DBMasterPassword;
    var DBAddress = event.ResourceProperties.DBAddress;
    var DBListeningPort = event.ResourceProperties.DBListeningPort;
    var DBName = event.ResourceProperties.DBName;
    
    script = script + DBMasterUserName + ":" + DBMasterPassword + "@" + DBAddress + ":" + DBListeningPort + "/" + DBName;

    download()
        .then(open)
        .then(execute)
        .then(() => {
            response.send(event, context, response.SUCCESS, responseData);
        })
        .catch((err) => {
            context.done(err);
        });
}

function download() {
    var s3 = new AWS.S3();
    return new Promise((resolve) => {
        s3.getObject({
            Bucket: "honey-badger-data",
            Key: "sweetskills.zip"
        })
        .createReadStream()
        .pipe(fs.createWriteStream('/tmp/sweetskills.zip')
            .on('close', () => {
                    resolve();
            })
        );
    });
}

function open() {
    return new Promise((resolve) => {
        fs.createReadStream('/tmp/sweetskills.zip')
        .pipe(unzip.Extract({ path: '/tmp' })
            .on('close', () => {
                    resolve();
            })
        );
    });
}

function execute() {
    console.log(script);
    const exec = require('child_process').exec;
    return new Promise((resolve) => {
        const child = exec(script, (err, stdout, stderr) => {
            if(err) {
                console.log(err);
            }
            console.log(stdout);
            console.log(stderr);
            resolve();
        });
    });
}
