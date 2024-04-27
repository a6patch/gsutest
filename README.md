# GetSetUp Test Project (gsutest)

## Notes

1) I'm going to manage the scope of this project based on a reasonable time to implement of 3 hours overall.  In order to keep within the overall time budget, I will create stubs for functionality that wasn't quite in scope, or describe the thinking for why I might have done something in a certain way.  

2) The slack notifier I'm setting up as a separate lambda function, triggered by an SNS subscription on a "SlackNotifier" topic.  The API function can post SNS messages to request the slack message be sent (the message text and slack channel are both encapsulated in the SNS message).  Since I don't really have a dev slack app,  I'm implementing all the code for the post to slack, but commenting out the actual call.  To finish it would require creating a slack app, opting/permissioning it on a slack account, etc.  The slack token could then be added to the project, probably as a SSM secure parameter which could be fetched by the slackNotifier lambda on startup.  To validate the SNS pub/sub and triggering of the slackNotifier, I observed the loggroup for the slackNotifier where the messages and slack ID were dumped instead of making the call to the slack api.  

3) There are things I would do differently for a full-blown project rather than a test problem.  Mostly I would paramaterize a lot more things properly.  I don't have the project configured to deploy to specific regions, or to deploy different environments (dev/qa/staging/prod, etc).  I'm just using my default region for my AWS credentials and using the standard cdk deploy.

4) My coupling of the AWS services is simpler than I would do for a real application.  Instead of just SNS pub/sub, I would probably set up an SQS for the slackNotifier, with dead letter queues for the SNS posting and SQS processing for better overall resiliancy.  

4) Overall, the set of AWS resources to deploy the functionality as serverless is an api gateway resource, with a GET method added for /multiply path.  Incrementally adding more methods for add, subtract, divide, etc would be straightforward in the cdk stack, and the cooresponding handling added to the Lambda.  I am using query string parameters for simplicity. A more useful math api would probably parse actual math expressions instead of having canned parameters like this.

5) Also for simplicity, I put all the cdk resources into a single stack for the gsutest app.  For a real application, it would likely be multiple stacks, organized by function.  For example, the SNS topic and slackNotifier lambda would be its own stack, and the api gateway and mathApi lambda would be another.  

6) Normally a build and deployment could be done in a pipeline using GitHub Actions.  I am just running this locally by hand to simplify the process.  My AWS credentials are configured using the normal ~/.aws location.

To install an test this, clone the repo:
cd gsutest
npm install
npm run build
cdk bootstrap
cdk deploy
cdk destroy