import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isApolloError } from '@apollo/client'

import { useUpdateTaskMutation } from '../generated/graphql-frontend'

interface IFormValues {
  title: string
}

interface IProps {
  id: number
  initialFormValues: IFormValues
}

const UpdateTaskForm: React.FC<IProps> = ({ id, initialFormValues }) => {
  const router = useRouter()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [updateTask, { error, loading }] = useUpdateTaskMutation({
    onCompleted: (data) => {
      if (data.updateTask) {
        router.push('/')
      }
    },
  })

  const onFormValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues((prevFormValues) => ({ ...prevFormValues, [name]: value }))
  }

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) {
      return
    }

    try {
      await updateTask({ variables: { input: { id, ...formValues } } })
    } catch (error) {
      if (isApolloError(error)) {
        // @todo Handle the error.
      }
    }
  }

  return (
    <form onSubmit={onFormSubmit}>
      {error && <p className="alert-error">{error.message}</p>}
      <p>
        <label htmlFor="title" className="field-label">
          Title
        </label>
        <input
          type="text"
          name="title"
          className="text-input"
          value={formValues.title}
          onChange={onFormValueChange}
        />
      </p>
      <p>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Loading...' : 'Save'}
        </button>
      </p>
    </form>
  )
}

export default UpdateTaskForm
