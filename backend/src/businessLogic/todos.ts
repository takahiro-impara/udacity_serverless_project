import * as uuid from 'uuid'

//import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function GetTodosFromuserId(userId: string) {
  return todoAccess.GetTodosFromuserId(userId)
}

export async function createNewTodo(event: any) {
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

  return todoAccess.createNewTodo(newItem)
}

export async function updateTodo(event: any) {
  const updateTodo: UpdateTodoRequest = JSON.parse(event.body)
  const todoId = event.pathParameters.todoId
  const userId = event.requestContext.authorizer.principalId

  const updateItem = {
    todoId,
    userId,
    ...updateTodo
  }
  return todoAccess.updateTodo(updateItem)
}

export async function deleteTodo(event: any) {
  const todoId = event.pathParameters.todoId
  const userId = event.requestContext.authorizer.principalId
  return todoAccess.deleteTodo(todoId, userId)
}
export async function getUploadUrl(imageId: string) {
  const uploadUrl = await todoAccess.getUploadUrl(imageId)
  return uploadUrl
}

export async function putImage(event: any, imageId: string) {
  const todoId = event.pathParameters.todoId
  const userId = event.requestContext.authorizer.principalId
  return todoAccess.putImage(todoId, userId, imageId)
}