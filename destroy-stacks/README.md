# Autodelete stacks
This Lambda Function is triggered by a CloudWatch scheduled event (chron job) to automatically delete stacks on a predetermined schedule in order to save on resource costs.

### Dependency:  Create CloudWatch scheduled event to work as a trigger
As implemented in [Sweet Skills CloudFormation](github.com/sweetskills/cloud-formation) there are three auto destroy policies:  Never, Daily, and Weekend.  The Never case results in a stack that will, as the name implies, never be auto destroyed.  The Daily policy indicates that a stack should be auto destroyed at the end of each day, and Weekend indicates auto destruction at the end of each Friday.

To enable this workflow we need to create CloudWatch scheduled events and use them to trigger this Lambda Function.

The chron schedules are:
- Daily:    0 22 ? * * *
- Weekend:  0 22 ? * FRI *

In order to reuse this Lambda Function for any arbitrary deletion policy the scheduled event must include a JSON payload of params which match the auto destroy policy of each stack.  This payload takes the form
```{"schedule":"<policy>"}```

### Overview of auto destroy flow
1. New stacks created from [Sweet Skills CloudFormation](github.com/sweetskills/cloud-formation) will include an Output field on the root template called 'AutoDestroyPolicy' where the value is either Daily, Weekend, or Never.
2. CloudWatch Scheduled Events are created for any policies which require stack deletion (in this case Daily and Weekend).  The event includes a payload with the policy it should trigger (again, Daily or Weekend)
3. When the Lambda Function runs it queries all stacks and deletes the ones whose AutoDestroyPolicy property matches the payload event it received