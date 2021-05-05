import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODO_TABLE

const logger = createLogger('auth')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('delete todo event', event)

  await deleteTodo(event)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

async function deleteTodo(event: any) {
  await docClient
    .delete({
      TableName: todosTable,
      Key: {
        "todoId": event.pathParameters.todoId,
        "userId": event.requestContext.authorizer.principalId
      },
      ConditionExpression:"userId = :u",
      ExpressionAttributeValues: {
          ":u": event.requestContext.authorizer.principalId
      },
    })
    .promise()
  logger.info("delet item")
  return {}
}