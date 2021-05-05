import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODO_TABLE

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //const todoId = event.pathParameters.todoId
  //const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('update todo event', event)

  await updateTodo(event)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

async function updateTodo(event: any) {
  const updateTodo: UpdateTodoRequest = JSON.parse(event.body)

  await docClient
    .update({
      TableName: todosTable,
      Key: {
        "todoId": event.pathParameters.todoId,
        "userId": event.requestContext.authorizer.principalId
      },
      UpdateExpression: "set done = :d",
      ExpressionAttributeValues:{
        ":d": updateTodo.done,
      },
      ReturnValues:"UPDATED_NEW"
    })
    .promise()
  logger.info("updated item", updateTodo)
  return {}
}