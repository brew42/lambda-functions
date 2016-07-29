<!--
Tags:  AWS, CodePipeline, Lambda Function, S3, Static Site Deploy
-->
# Honey Badger Lambda Functions

This repository contains the Lambda Functions which we have created and are using on project Honey Badger.  For more information please view each project's README.

---

### List of Lambda Functions
[CloudFormation event handler](/cloudformation-event-handler-hb)
- Receives CloudFormation events from an SNS topic and on stack complete events (CREATE_COMPLETE, CREATE_FAILED, DELETE_COMPLETE, DELETE_FAILED) triggers another SNS topic to send text notifications


[GitHub commit handler](/github-commit-handler-hb)
- Receives GitHub commit events, identifies the files that have been added, modified, and deleted in master and then calls corresponding events for maintaining a copy of the repository contents in an S3 bucket
- Currently being used to copy CloudFormation templates from [honey-badger-cloud-formation](https://github.com/pariveda/honey-badger-cloud-formation) to a dedicated S3 bucket to help with the repeatability of the CloudFormation workflow


[Delete file from S3](/delete-file-from-s3)
- Receives link of S3 file to delete, triggered from [hb-cf-github-commit](hb-cf-github-commit)


[Save remote file to S3](/save-remote-file-to-s3)
- Receives URL of file to download and save to S3, triggered from [hb-cf-github-commit](hb-cf-github-commit)


[Unzip to S3](/unzip-to-s3)
- Used with the 'Invoke' action in a CodePipeline to unzip files from a previous stage and deploy them to a given S3 bucket
- Currently being used to deploy built website dist files to S3 buckets set up for static site hosting

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request
