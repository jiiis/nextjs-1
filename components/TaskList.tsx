import React from 'react'

import { Task } from '../generated/graphql-frontend'
import TaskListItem from './TaskListItem'

interface IProps {
  tasks: Task[]
}

const TaskList: React.FC<IProps> = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
