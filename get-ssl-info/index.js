'use strict'

var response = require('./response.js');
var AWS = require('aws-sdk');
var fs = require('fs');

var acm = '';
var oci = '';
var responseData = {};

exports.handler = (event, context,callback) => {

	console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));

    if (event.RequestType == 'Delete') {
        response.send(event, context, response.SUCCESS);
        return;
    }

    downloadAcm()
        .then(downloadOai)
        .then(readAcm)
        .then(readOai)
        .then(() => {
            response.send(event, context, response.SUCCESS, responseData);
        })
        .catch((err) => {
            context.done(err);
        });
}

function downloadAcm() {
    var s3 = new AWS.S3();
    return new Promise((resolve) => {
        s3.getObject({
            Bucket: "honey-badger-data",
            Key: "acmCertificateArn.txt"
        })
        .createReadStream()
        .pipe(fs.createWriteStream('/tmp/acmCertificateArn.txt')
            .on('close', () => {
                resolve();
            })
        );
    });
}

function downloadOai() {
    var s3 = new AWS.S3();
    return new Promise((resolve) => {
        s3.getObject({
            Bucket: "honey-badger-data",
            Key: "originAccessIdentity.txt"
        })
        .createReadStream()
        .pipe(fs.createWriteStream('/tmp/originAccessIdentity.txt')
            .on('close', () => {
                resolve();
            })
        );
    });
}


function readAcm() {
    return new Promise((resolve) => {
        fs.readFile('/tmp/acmCertificateArn.txt', 'utf8', function read(err, data) {
            if (err) {
                throw err;
            }

            responseData["acmCertificateArn"] = data;
            console.log(data);

            resolve();
        });
    });
}

function readOai() {
    return new Promise((resolve) => {
        fs.readFile('/tmp/originAccessIdentity.txt', 'utf8', function read(err, data) {
            if (err) {
                throw err;
            }

            responseData["originAccessIdentity"] = data;
            console.log(data);

            resolve();
        });
    });
}
