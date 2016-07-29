# CloudFormation event handler
This Lambda Function integrates with CloudFormation to receive stack events and pass them along to an SNS topic for text notifications.  Currently the function is written to only pass along CREATE\_COMPLETE/CREATE\_FAILED and DELETE|_COMPLETE/DELETE\_FAILED events to minimize notifications.

---

## Connecting the Lambda function to SNS topics
- Create a new Lambda function either inline or by zipping index.js and uploading it
- Create a new SNS topic for receiving CloudFormation events and subscribe the Lambda function to the topic
- Create a new SNS topic for sending SMS
- Create a config folder in S3 with the folder name matching the Lambda function name
- Create a properties.json file with the ARN for the SNS text notification topic and place it in the config folder
```JSON
    {
        "textNotification": "SNS_ARN"
    }
```

---

## How to use with CloudFormation
- Under the advanced options section send notifications to an existing SNS topic and select the one this Lambda is subscribed to

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request