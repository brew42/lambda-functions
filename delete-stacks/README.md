# Delete All CloudFormation Stacks
This Lambda function is a utility for deleting all CloudFormation Stacks.

---

## How it works
- When Lambda function is invoked it grabs all stack id's that are in the CREATE_COMPLETE, CREATE_IN_PROGRESS, UPDATE_COMPLETE, CREATE_FAILED, DELETE_FAILED states and deletes them
- Came in handy when I had custom resources that were not being deleted (DELTE_FAILED).  Was able to delete them all with this function

---

### Additional fields & features
If you would like to see additional features please create an issue or pull request