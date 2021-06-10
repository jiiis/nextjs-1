import React, { useState } from 'react'

import { useCreateTaskMutation } from '../generated/graphql-frontend'

interface IProps {
  done: () => void
}

const CreateTaskForm: React.FC<IProps> = ({ done }) => {
  const [titleInput, setTitleInput] = useState('')
  const [createTask, { error, loading }] = useCreateTaskMutation({
    onCompleted: () => {
      done()

      setTitleInput('')
    },
  })

  const onTitleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(event.target.value)
  }
  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) {
      return
    }

    try {
      await createTask({ variables: { input: { title: titleInput } } })
    } catch (error) {}
  }

  return (
    <form onSubmit={onFormSubmit}>
      {error && <p className="alert-error">An error occurred.</p>}
      <input
        type="text"
        name="title"
        placeholder="What would you like to get done?"
        autoComplete="off"
        className="text-input new-task-text-input"
        value={titleInput}
        onChange={onTitleInputChange}
      />
    </form>
  )
}

export default CreateTaskForm
