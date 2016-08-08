# Delete file from S3
This Lambda function is a utility for emptying an S3 bucket.  On the Honey Badger project it is used to empty an S3 bucket that has been created by a CloudFormation stack before the stack, and therefore the S3 bucket, are deleted.

---

## How it works
- When the CloudFormation Stack is deleted it sends a "Delete" event to the Lambda Fucntion containing the name of the S3 bucket to be emptied.
- The Lambda Fucntion grabs the S3 Key names of all files in the S3 bucket and deletes them before the bucket is deleted by the CloudFormation Stack.

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request