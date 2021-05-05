import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('DataAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly todosTable = process.env.TODO_TABLE,
    private readonly bucketName = process.env.SIGNED_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
    private readonly baseS3url = 'https://' + bucketName + '.s3-' + process.env.REGION + '.amazonaws.com/',
    private readonly userIndex = process.env.USER_ID_INDEX,
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
  ) { }

  async GetTodosFromuserId(userId: string): Promise<TodoItem[]>{
    const params = {
    TableName: this.todosTable,
    IndexName: this.userIndex,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: {
        ":u": userId
    }
  }
    const result = await this.docClient
      .query(params)
      .promise()
    logger.info('query items ', result)

    const items = result.Items
    return items as TodoItem[]
  }

  async createNewTodo(TodoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: TodoItem
    })
      .promise()
    return TodoItem as TodoItem
  }

  async updateTodo(TodoItem: TodoItem) {
    await this.docClient
    .update({
      TableName: this.todosTable,
      Key: {
        "todoId": TodoItem.todoId,
        "userId": TodoItem.userId
      },
      UpdateExpression: "set done = :d",
      ExpressionAttributeValues:{
        ":d": TodoItem.done,
      },
      ReturnValues:"UPDATED_NEW"
    })
    .promise()
    logger.info("updated item", TodoItem)
    return {}
  }
  async deleteTodo(todoId: string, userId: string) {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          "todoId": todoId,
          "userId": userId
        },
        ConditionExpression:"userId = :u",
        ExpressionAttributeValues: {
            ":u": userId
        },
      })
      .promise()
    logger.info("delet item")
    return {}
  }
  async getUploadUrl(imageId: string) {
    const signedurl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })

    logger.info('signedurl', { 'signedurl': signedurl })
    return signedurl
  }
  async putImage(todoId: string, userId: string, imageId: string) {
    await this.docClient
    .update({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set attachmentUrl = :a",
      ExpressionAttributeValues:{
        ":a": this.baseS3url + imageId,
      },
      ReturnValues:"UPDATED_NEW"
    })
    .promise()
    logger.info("updated item")
    return {}
  }
}