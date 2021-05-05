import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODO_TABLE
const userIndex = process.env.USER_ID_INDEX

import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing event: ', event)
  const sub = event.requestContext.authorizer.principalId
  console.log('user sub: ', sub)

  const todoItems = await GetTodosFromuserId(sub)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ 'items': todoItems })
  }
}

async function GetTodosFromuserId(userId: string) {
  const params = {
    TableName: todosTable,
    IndexName: userIndex,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: {
        ":u": userId
    }
  }
  const result = await docClient
    .query(params)
    .promise()
  logger.info('query items ', result)

  const items = result.Items
  return items
  
}