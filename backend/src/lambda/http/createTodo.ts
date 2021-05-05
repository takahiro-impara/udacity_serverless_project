import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('create todo event', event)

  const newItem = await createNewTodo(event)
  logger.info('new Todo item', newItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}

async function createNewTodo(event: any) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  if (!newTodo.name) {
    throw new Error("invalid Item")
  }
  const todoId = uuid.v4()
  const userId = event.requestContext.authorizer.principalId
  const createAt = new Date().toISOString()
  const done = false

  const newItem = {
    todoId,
    userId,
    createAt,
    done,
    ...newTodo
  }

  await docClient
    .put({
      TableName: todosTable,
      Item: newItem
    })
    .promise()

  return newItem
}