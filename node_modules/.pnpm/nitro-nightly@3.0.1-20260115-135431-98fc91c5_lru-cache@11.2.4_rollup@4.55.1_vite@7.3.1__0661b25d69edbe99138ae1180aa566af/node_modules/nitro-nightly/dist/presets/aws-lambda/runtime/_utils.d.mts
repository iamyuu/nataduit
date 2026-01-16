import type { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from "aws-lambda";
import type { ServerRequest } from "srvx";
// Incoming (AWS => Web)
export declare function awsRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: unknown): ServerRequest;
// Outgoing (Web => AWS)
export declare function awsResponseHeaders(response: Response);
// AWS Lambda proxy integrations requires base64 encoded buffers
// binaryMediaTypes should be */*
// see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html
export declare function awsResponseBody(response: Response): Promise<{
	body: string;
	isBase64Encoded?: boolean;
}>;
