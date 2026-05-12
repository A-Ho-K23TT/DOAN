import React from 'react'
import TitleCard from './TitleCard'
import QuestionsContainer from './QuestionsContainer'
import AddButtons from './AddButtons'

const EditPanel = ({ 
  visible, 
  formTitle, 
  formDesc, 
  questions, 
  activeQ, 
  onTitleChange, 
  onDescChange, 
  onAddQuestion, 
  onAddSection, 
  onSave,
  ...questionProps
}) => {
  if (!visible) return null

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
      <TitleCard 
        title={formTitle} 
        description={formDesc} 
        onTitleChange={onTitleChange} 
        onDescChange={onDescChange} 
      />
      <QuestionsContainer 
        questions={questions} 
        activeQ={activeQ} 
        {...questionProps} 
      />
      <AddButtons 
        onAddQuestion={onAddQuestion} 
        onAddSection={onAddSection} 
        onSave={onSave} 
      />
    </div>
  )
}

export default EditPanel