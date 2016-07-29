# Save file to S3
This Lambda function is a utility for saving remote files to S3.  On the Honey Badger project it is used with the [GitHub commit handler](../github-commit-handler-hb) and [delete file from S3](../delete-file-from-s3) Lambda functions to keep our [CloudFormation templates](https://github.com/pariveda/honey-badger-cloud-formation) synced in an S3 bucket to faciliate easy CloudFormation execution.

---

## Connecting the Lambda function to an SNS topic
- Create a new Lambda function either inline or by zipping index.js and uploading it
- Create a new SNS topic for receiving delete file requests and subscribe the Lambda function to the topic

---

## How this, [GitHub commit handler](../github-commit-handler-hb), and [delete file from S3](../delete-file-from-s3) work together
- GitHub webhook is configured to send notifications to SNS topic when code is commited and merged
- [GitHub commit handler](../github-commit-handler-hb) is subscribed to an SNS topic which receives GitHub event
- [Save remote file to S3](../save-remote-file-to-s3) is susbscribed to an SNS topic which can be notified of files being added/updated
- [Delete file from S3](../delete-file-from-s3) is susbscribed to an SNS topic which can be notified of files being removed
- When the commit/merge is on the master branch [GitHub commit handler](../github-commit-handler-hb) notifies [save remote file to S3](../save-remote-file-to-s3) for file adds/updates and [delete file from S3](../delete-file-from-s3) for file deletes by calling the SNS topics that they are subscribed to

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request