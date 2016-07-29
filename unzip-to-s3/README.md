<!--
Tags:  AWS, CodePipeline, Lambda Function, S3, Static Site Deploy
-->
# Unzip to S3

This Lambda Function integrates with AWS CodePipeline to deploy the contents of a zipped file to an S3 location.  The intended use case is to act as an invokable deploy stage of a pipeline for websites involving a build stage, but ultimately the function is agnostic to final use case and will deploy the contents of a given zip file to any specified S3 bucket.  The instructions that follow assume the intended use case.

---

### How to create the Lambda Function
- Clone the repo
- Create a zip file containing index.js and node_modules
- Create a new Lambda Function with the 'Upload a .ZIP file' option and upload the file
    - You can also upload the zipped file to S3 and copy the link for the 'Upload a file from Amazon S3' option
- Specify the configuration values you want for the function's execution environment - memory, timeout, security role, etc.

---

## How to use in a CodePipeline
- Create a CodePipeline with source and build steps
- Add an additional stage with the 'Invoke' action and 'AWS Lambda' as the provider
- The input artifact must match the output artifact of the previous stage
- User parameters must include a JSON string specifying where the files should be deployed to in the format with your own values for REGION and BUCKET
```JSON
    {
        "staticSiteRegion": "REGION",
        "staticSiteBucket": "BUCKET"
    }
```
- Note that if using the online console your input field will look like this:  {"staticSiteRegion":"REGION","staticSiteBucket":"BUCKET"}

---

### Limitations
- Currently the script assumes (and only processes) a single input artifact

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request
