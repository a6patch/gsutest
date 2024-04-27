import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';

export class GsutestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SNS Topic for slack notifications
    const topic = new sns.Topic(this, 'SlackNotifications');

    // Lambda to process the MathAPI requests.  It needs the ARN of the slackNotification SNS
    const MathFunction = new lambda.Function(this, 'MathFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('lambda'), 
      handler: 'mathApi.handler', 
      environment: {
        SNS_TOPIC_ARN: topic.topicArn 
    }
    });
    
    // Permission to post to the SNS Topic
    topic.grantPublish(MathFunction);
    
    // API Gateway for the MathAPI
    const api = new apigateway.LambdaRestApi(this, 'MathApi', {
      handler: MathFunction,
      proxy: false,
    });
        
    // Define the '/multiply' resource with a GET method
    const multiplyResource = api.root.addResource('multiply');
    multiplyResource.addMethod('GET');
    
    // Lambda for the slackNotifier processing/sending
    const slackNotifier = new lambda.Function(this, 'SlackNotifier', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('lambda'), 
      handler: 'slackNotifier.handler', 
      environment: {
          SNS_TOPIC_ARN: topic.topicArn 
      }
    });

    // Subscribe to the SNS topic for slack notifications
    topic.addSubscription(new subs.LambdaSubscription(slackNotifier));


  }
}
