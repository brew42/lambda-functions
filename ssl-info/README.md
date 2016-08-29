# Populate Amazon RDS Database
This Lambda function is a utility for populating a newly created RDS Database, it is written in nodejs v4.x, relies on synchronization to perform scripting, and includes the postgresql v9.5 binaries for linix

---

## Lambda function and [CloudFormation](https://github.com/pariveda/honey-badger-cloud-formation)
- Lambda function is statically defined and therefore needs to be manually updated.  Zip up the contents of this repository and upload to an S3 bucket (honey-badger-lambda-functions/sweetskills/populate-rds). Update the code of the lambda function with the URL of the .zip file in the S3 bucket 
- A custom resource in _full-stack.template passes the database name, user name, password, host, and port number of a newly created RDS stack to the lambda function

---
## How the Lambda function works
- AWS-SDK is used to download the zipped sql files from an S3 bucket to the local lambda environment
- Files are unzipped and then a script populates the database using the psql executable included with the lambda function
- A response is sent to the CloudFormation stack to indicate that the lambda function has finished execution and that the stack can continue creation

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request
