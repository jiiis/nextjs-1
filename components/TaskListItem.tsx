import React, { useEffect } from 'react'
import Link from 'next/link'
import { Reference } from '@apollo/client'

import {
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../generated/graphql-frontend'

interface IProps {
  task: Task
}

const TaskListItem: React.FC<IProps> = ({ task }) => {
  const [updateTask, { error: updateTaskError, loading: updateTaskLoading }] =
    useUpdateTaskMutation({ errorPolicy: 'all' })
  const [deleteTask, { error: deleteTaskError, loading: deleteTaskLoading }] =
    useDeleteTaskMutation({
      errorPolicy: 'all',
      variables: { id: task.id },
      update: (cache, { data }) => {
        const deletedTask = data?.deleteTask

        if (!deletedTask) {
          return
        }

        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter(
                (taskRef) => readField('id', taskRef) !== deletedTask.id
              )
            },
          },
        })
      },
    })

  useEffect(() => {
    if (updateTaskError) {
      alert('An error occurred while updating task status. Please try again.')
    }
  }, [updateTaskError])

  useEffect(() => {
    if (deleteTaskError) {
      alert('An error occurred while deleting task. Please try again.')
    }
  }, [deleteTaskError])

  const onStatusCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (updateTaskLoading) {
      return
    }

    const newStatus = event.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active

    try {
      await updateTask({
        variables: { input: { id: task.id, status: newStatus } },
      })
    } catch (error) {}
  }

  const onDeleteButtonClick = async () => {
    if (deleteTaskLoading) {
      return
    }

    try {
      await deleteTask()
    } catch (error) {}
  }

  return (
    <li className="task-list-item">
      <label className="checkbox">
        <input
          type="checkbox"
          checked={task.status === TaskStatus.Completed}
          disabled={updateTaskLoading}
          onChange={onStatusCheckboxChange}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${task.id}`}>
        <a className="task-list-item-title">{task.title}</a>
      </Link>
      <button
        className="task-list-item-delete"
        disabled={deleteTaskLoading}
        onClick={onDeleteButtonClick}
      >
        &times;
      </button>
    </li>
  )
}

export default TaskListItem
