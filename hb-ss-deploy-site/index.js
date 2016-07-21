'use strict'
var fs = require('fs');
var path = require('path');
var unzip = require('yauzl');
var mkdirp = require('mkdirp');
var mime = require('mime');
var AWS = require('aws-sdk');
var codePipeline = new AWS.CodePipeline();

const filePath = '/tmp/artifact.zip', cwd = '/tmp';

exports.handler = (event, context) => {    
    let job = event['CodePipeline.job'];
    console.log('Received CodePipeline job', JSON.stringify(job));
    let userParams = getUserParams(job);
    console.log('With user parameters', JSON.stringify(userParams));

    let sourceClient = getSourceClient(job);
    let sourceBucket = getSourceBucket(job);
    let destinationClient = getDestinationClient(userParams);
    
    getFiles(sourceClient, sourceBucket)
        .then(unzipFiles)
        .then( (files) => {
            return Promise.all([files, uploadFiles(files, destinationClient)]);
        })
        .then(() => {
            return signalCodePipelineSuccess(job);
        })
        .then( () => {
            return signalLambdaComplete(context);
        })
        .catch( (err) => {
            signalCodePipelineFailure(job, err);
            signalLambdaComplete(context, err);
        });
};

function getUserParams(job){
    console.log('Getting user parameters');
    return JSON.parse(job.data.actionConfiguration.configuration.UserParameters);
}

function getSourceClient(job){
    console.log('Getting source client');
    return new AWS.S3({
        accessKeyId: job.data.artifactCredentials.accessKeyId,
        secretAccessKey: job.data.artifactCredentials.secretAccessKey,
        sessionToken: job.data.artifactCredentials.sessionToken,
        signatureVersion: 'v4'
    });
}

// currently only allows for a single input artifact
function getSourceBucket(job){
    console.log('Getting source bucket');
    return {
        Bucket: job.data.inputArtifacts[0].location.s3Location.bucketName,
        Key: job.data.inputArtifacts[0].location.s3Location.objectKey
    }
}

function getDestinationClient(userParams){
    console.log('Getting destination client');
    return new AWS.S3({
        region: userParams.staticSiteRegion,
        params: {
            Bucket: userParams.staticSiteBucket
        }
    });
}

var getFiles = (sourceClient, sourceBucket) => {
    return new Promise((resolve, reject) => {
        console.log('Downloading build artifact');
        
        const req = sourceClient.getObject(sourceBucket);
        req.on('error', reject);
        
        const writeStream = fs.createWriteStream(filePath);
        const readStream = req.createReadStream();
        readStream.on('error', reject);
        readStream.pipe(writeStream);
        
        writeStream.on('error', reject);
        writeStream.once('finish', resolve);
    });
};

// TODO this is nasty copy pasta from another project, can it be cleaned up?
var unzipFiles = () => {
    return new Promise((resolve, reject) => {
        console.log('Unzipping build artifact');
        const files = [];
        unzip.open(filePath, { autoclose: false, lazyEntries: true }, (err, zipfile) => {
            if (err) reject;
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
                // directory file names end with '/'
                mkdirp(path.join(cwd, entry.fileName), (err) => {
                    if (err) reject;
                        zipfile.readEntry();
                });
            } else {
                zipfile.openReadStream(entry, (err, readStream) => {
                    if (err) reject;
                    // ensure parent directory exists
                    mkdirp(path.join(cwd, path.dirname(entry.fileName)), (err) => {
                        if (err) reject;
                        readStream.pipe(fs.createWriteStream(path.join(cwd, entry.fileName)));
                        readStream.on('end', () => {
                            // add file details to files array
                            files.push({
                                key: entry.fileName,
                                body: fs.createReadStream(path.join(cwd, entry.fileName)),
                                mimetype: mime.lookup(path.join(cwd, entry.fileName))
                            });
                            zipfile.readEntry();
                        });
                    });
                });
            }
        });
        zipfile.once('end', () => {
            zipfile.close();
            resolve(files);
        });
    });
  });
};

var uploadFiles = (files, destinationClient) => {
    return Promise.all( files.map( (file) => {
        console.log('Uploading file');
        const params = {
            Key: file.key,
            Body: file.body,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };
        return destinationClient.putObject(params).promise();
    }));
};

var signalCodePipelineSuccess = (job) => {
    console.log('CodePipeline is complete!');
    let params = {
        jobId: job.id,
        currentRevision: {
            changeIdentifier: '1',
            revision: '1'
        }
    };
    return codePipeline.putJobSuccessResult(params).promise();
};

var signalCodePipelineFailure = (job, err) => {
    let params = {
        jobId: job.id,
        failureDetails: {
            message: JSON.stringify(err),
            type: 'JobFailed'
        }
    };
    return codePipeline.putJobFailureResult(params).promise();
};

var signalLambdaComplete = (context, err) => {
    return new Promise((resolve, reject) => {
        var message = err ? err : 'Lambda is complete!';
        console.log(message);
        context.done(message);
        resolve();
    });
};