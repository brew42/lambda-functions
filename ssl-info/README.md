# Get SSL Certificates
This Lambda function returns SSL certificate info to Cloudformation

---
## Lambda function and [CloudFormation](https://github.com/pariveda/honey-badger-cloud-formation)
- Lambda function pulls certificate files from s3 bucket and returns the information to Cloudformation.
- Cloudformation uses the information to set up a CloudFront Distribution and to request additional SSL certificates from letsencrypt

---
## How the Lambda function works
- AWS-SDK is used to download the files from an S3 bucket to the local lambda environment
- Files read and the contents are ouput to the CloudFormation stack
- A response is sent to the CloudFormation stack containing the file outputs and indicating that the lambda function has finished execution and that the stack can continue creation

---
### Additional fields & features
If you would like to see additional features please create an issue or pull request
