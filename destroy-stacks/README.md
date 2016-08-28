# Autodelete stacks

# Dependency:  create CloudWatch scheduled event to work as a trigger
Cron schedule for daily delete:  0 22 ? * * * (don't know why but AWS required ?)

Cron schedule for weekend delete:  0 22 ? * FRI * (don't know why but AWS required ?)