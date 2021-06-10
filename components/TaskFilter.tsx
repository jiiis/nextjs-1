import React from 'react'
import Link from 'next/link'

import { TaskStatus } from '../generated/graphql-frontend'

interface IProps {
  status?: TaskStatus
}

const TaskFilter: React.FC<IProps> = ({ status }) => {
  return (
    <ul className="task-filter">
      <li>
        <Link href="/" scroll={false}>
          <a className={!status ? 'task-filter-active' : ''}>All</a>
        </Link>
      </li>
      <li>
        <Link href="/[status]" as={`/${TaskStatus.Active}`} shallow={true} scroll={false}>
          <a className={status === TaskStatus.Active ? 'task-filter-active' : ''}>Active</a>
        </Link>
      </li>
      <li>
        <Link href="/[status]" as={`/${TaskStatus.Completed}`} shallow={true} scroll={false}>
          <a className={status === TaskStatus.Completed ? 'task-filter-active' : ''}>Completed</a>
        </Link>
      </li>
    </ul>
  )
}

export default TaskFilter
