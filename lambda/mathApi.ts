import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();
const topicArn = process.env.SNS_TOPIC_ARN;

async function publishMessage(message: string, channel: string): Promise<void> {
    const params = {
        Message: JSON.stringify({
            channel: channel,
            text: message
        }),
        TopicArn: topicArn
    };

    const command = new PublishCommand(params);
    try {
        const data = await snsClient.send(command);
    } catch (error) {
        console.error(error);
    }
}


export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const routeKey = `${event.httpMethod} ${event.path}`;
    console.log('routeKey', routeKey);
    
    // routeKey is used to key on the API method and path and call the corresponding function.
    // For this example, I include the "GET /multiply" functionality inline, but it would generally be 
    // broken out into a set of functions/files. 
    switch (routeKey) {
        case 'GET /multiply':
            let n1 = Number(event.queryStringParameters?.['n1']);
            let n2 = Number(event.queryStringParameters?.['n2']);
            let slack = event.queryStringParameters?.['slack'];
            
            if (slack === 'true' || slack === 'yes' || slack === '1') {
                await publishMessage(`Called MathAPI: ${routeKey} with n1=${n1} & n2=${n2}`, "channelID");
            }
            if (!n1 || !n2) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'n1 and n2 number parameters are required and should be valid numbers.' }),
                };
            }

            try {
                const product = n1 * n2;
                
                return {
                    statusCode: 200,
                    body: JSON.stringify({ result: product }),
                };
            } catch (error: any) {
                const message = error instanceof Error ? error.message : 'An unknown error has occurred.';
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: `Could not perform the operation. ${message}` }),
                };
            }
            break;

        case 'GET /add':
            // Other methods could be added here.  Instead of handling them inline like this trivial example, they should be in their own handler file.
            break;
        
        default:
            return {
                statusCode: 400,
                body: `Route ${routeKey} does not exist`
            }
    }

}