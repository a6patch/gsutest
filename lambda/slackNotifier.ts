import { SNSHandler, SNSEvent } from 'aws-lambda';
//import { WebClient } from '@slack/web-api';

// I commented out the actual slack api stuff.  You would create a slack app, permission it for the slack account
// and get a slack token to make the calls.  The token would be treated as secret and stored in SSM and fetched.

export const handler: SNSHandler = async (event: SNSEvent) => {
  //const SLACK_TOKEN = process.env.SLACK_TOKEN || '';
  //const slack = new WebClient(SLACK_TOKEN);

  for (const record of event.Records) {
    const { text, channel } = JSON.parse(record.Sns.Message);
    try {
      //await slack.chat.postMessage({ channel: channel, text: text });
      console.log(record.Sns.Message);
    } catch (error) {
      console.error(`Failed to send Slack message: ${error}`);
    }
  }
};