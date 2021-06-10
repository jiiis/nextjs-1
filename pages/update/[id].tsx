import React from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Error from 'next/error'

import {
  TaskDocument,
  TaskQuery,
  TaskQueryVariables,
  useTaskQuery,
} from '../../generated/graphql-frontend'
import { initializeApollo } from '../../lib/client'
import UpdateTaskForm from '../../components/UpdateTaskForm'

const UpdateTask = () => {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? +router.query.id : NaN

  if (!id) {
    return <Error statusCode={404} />
  }

  const { data, error, loading, refetch } = useTaskQuery({ variables: { id } })
  const task = data?.task

  return loading ? (
    <p>Loading...</p>
  ) : error ? (
    <p>An error occurred.</p>
  ) : !task ? (
    <Error statusCode={404} />
  ) : (
    <UpdateTaskForm id={task.id} initialFormValues={{ title: task.title }} />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = typeof params?.id === 'string' ? +params.id : NaN

  if (!id) {
    return { props: {} }
  }

  const apolloClient = initializeApollo()

  await apolloClient.query<TaskQuery, TaskQueryVariables>({
    query: TaskDocument,
    variables: { id },
  })

  return { props: { initialApolloState: apolloClient.cache.extract() } }
}

export default UpdateTask
