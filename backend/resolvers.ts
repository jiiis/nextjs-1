import { UserInputError } from 'apollo-server-micro'
import { ServerlessMysql } from 'serverless-mysql'
import { OkPacket } from 'mysql'

import { Resolvers, TaskStatus } from '../generated/graphql-backend'

interface IContext {
  db: ServerlessMysql
}

interface IDbTask {
  id: number
  title: string
  task_status: TaskStatus
}

type TasksQueryResult = IDbTask[]

export const getTaskById = async (id: number, db: ServerlessMysql) => {
  const dbTasks = await db.query<TasksQueryResult>(
    'SELECT id, title, task_status FROM tasks WHERE id = ?',
    [id]
  )

  await db.end()

  if (dbTasks.length) {
    const { id, title, task_status } = dbTasks[0]

    return { id, title, status: task_status }
  }

  return null
}

export const resolvers: Resolvers<IContext> = {
  Query: {
    async tasks(_, { status }, { db }) {
      let dbTasks: TasksQueryResult

      if (status) {
        dbTasks = await db.query<TasksQueryResult>(
          'SELECT id, title, task_status FROM tasks WHERE task_status = ?',
          [status]
        )
      } else {
        dbTasks = await db.query<TasksQueryResult>(
          'SELECT id, title, task_status FROM tasks'
        )
      }

      await db.end()

      return dbTasks.map(({ id, title, task_status }) => ({
        id,
        title,
        status: task_status,
      }))
    },
    task(_, { id }, { db }) {
      return getTaskById(id, db)
    },
  },
  Mutation: {
    async createTask(_, { input }, { db }) {
      const result = await db.query<OkPacket>(
        'INSERT INTO tasks (title, task_status) VALUES(?, ?)',
        [input.title, TaskStatus.Active]
      )

      return {
        id: result.insertId,
        title: input.title,
        status: TaskStatus.Active,
      }
    },
    async updateTask(_, { input }, { db }) {
      const columns: string[] = []
      const sqlParams: any[] = []

      if (input.title) {
        columns.push('title = ?')
        sqlParams.push(input.title)
      }

      if (input.status) {
        columns.push('task_status = ?')
        sqlParams.push(input.status)
      }

      if (columns.length === 0) {
        return getTaskById(input.id, db)
      }

      await db.query(`UPDATE tasks SET ${columns.join(', ')} WHERE id = ?`, [
        ...sqlParams,
        input.id,
      ])

      return getTaskById(input.id, db)
    },
    async deleteTask(_, { id }, { db }) {
      const task = await getTaskById(id, db)

      if (!task) {
        throw new UserInputError(`No task found for id "${id}"!`)
      }

      await db.query('DELETE FROM tasks WHERE id = ?', [id])

      return task
    },
  },
}