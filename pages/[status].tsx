import { useEffect, useRef } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Error from 'next/error'

import {
  TasksDocument,
  TasksQuery,
  TasksQueryVariables,
  TaskStatus,
  useTasksQuery,
} from '../generated/graphql-frontend'
import { initializeApollo } from '../lib/client'
import CreateTaskForm from '../components/CreateTaskForm'
import TaskList from '../components/TaskList'
import TaskFilter from '../components/TaskFilter'

const isTaskStatus = (status: string): status is TaskStatus =>
  Object.values(TaskStatus).includes(status as TaskStatus)

export default function Home() {
  const router = useRouter()
  const status =
    typeof router.query.status === 'string' ? router.query.status : undefined

  if (status !== undefined && !isTaskStatus(status)) {
    return <Error statusCode={404} />
  }

  const prevStatus = useRef(status)

  useEffect(() => {
    prevStatus.current = status
  }, [status])

  const { data, error, loading, refetch } = useTasksQuery({
    variables: { status },
    fetchPolicy: prevStatus.current === status ? 'cache-first' : 'cache-and-network'
  })
  const tasks = data?.tasks

  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm done={refetch} />
      {loading && !tasks ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p>An error occurred!</p>
      ) : !tasks || !tasks.length ? (
        <p className="no-tasks-message">You've got no tasks.</p>
      ) : (
        <TaskList tasks={tasks} />
      )}
      <TaskFilter status={status} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const status = typeof params?.status === 'string' ? params.status : undefined

  if (status !== undefined && !isTaskStatus(status)) {
    return { props: {} }
  }

  const apolloClient = initializeApollo()

  await apolloClient.query<TasksQuery, TasksQueryVariables>({
    query: TasksDocument,
    variables: { status },
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  }
}
