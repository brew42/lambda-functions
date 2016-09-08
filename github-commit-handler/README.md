# GitHub commit handler
This Lambda function receives and processes GitHub notification events.  On the Honey Badger project it is used with the [save remote file to S3](../save-remote-file-to-s3) and [Delete file from S3](../delete-file-from-s3) Lambda functions to keep our [CloudFormation templates](https://github.com/pariveda/honey-badger-cloud-formation) synced in an S3 bucket to faciliate easy CloudFormation execution.

---

## Connecting the Lambda function to an SNS topic
- Create a new Lambda function either inline or by zipping index.js and uploading it
- Create a new SNS topic for receiving GitHub events and subscribe the Lambda function to the topic

---

## Registering SNS topic with GitHub
- Go to the repository settings and select 'Webhooks & services'
- Add a new Amazon SNS service integration with the SNS topic the Lambda function is subscribed to

---

## Configuring the Lambda function to call [save remote file to S3](../save-remote-file-to-s3) and [delete file from S3](../delete-file-from-s3)
- Create a config folder in S3 with the folder name matching the Lambda function name
- Create a properties.json file with the ARNs for the SNS topics that [save remote file to S3](../save-remote-file-to-s3) and [delete file from S3](../delete-file-from-s3) are subscribed to and place it in the config folder
```JSON
    {
        "saveToS3ARN": "SAVE_TO_S3_SNS_ARN",
        "deleteFromS3ARN": "DELETE_FROM_S3_SNS_ARN",
        "s3Bucket" : "S3_BUCKET_FOR_CLOUD_FORMATION_TEMPLATES"
    }
```

---

## How this, [save remote file to S3](../save-remote-file-to-s3), and [delete file from S3](../delete-file-from-s3) work together
- GitHub webhook is configured to send notifications to SNS topic when code is commited and merged
- [GitHub commit handler](../github-commit-handler-hb) is subscribed to an SNS topic which receives GitHub event
- [Save remote file to S3](../save-remote-file-to-s3) is susbscribed to an SNS topic which can be notified of files being added/updated
- [Delete file from S3](../delete-file-from-s3) is susbscribed to an SNS topic which can be notified of files being removed
- When the commit/merge is on the master branch [GitHub commit handler](../github-commit-handler-hb) notifies [save remote file to S3](../save-remote-file-to-s3) for file adds/updates and [delete file from S3](../delete-file-from-s3) for file deletes by calling the SNS topics that they are subscribed to

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request