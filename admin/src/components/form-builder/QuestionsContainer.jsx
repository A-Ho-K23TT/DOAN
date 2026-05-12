import React from 'react'
import SectionCard from './SectionCard'
import QuestionCard from './QuestionCard'

const QuestionsContainer = ({ 
  questions, 
  activeQ, 
  setActiveQ,
  onRemoveQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  onUpdateTitle,
  onUpdateSectionTitle,
  onUpdateSectionDesc,
  onChangeType,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onToggleRequired,
  onUpdateScale,
  onUpdateFileTypes,
  onAddGridRow,
  onRemoveGridRow,
  onUpdateGridRow,
  onAddGridCol,
  onRemoveGridCol,
  onUpdateGridCol
}) => {
  return (
    <div id="questions-container" className="space-y-3">
      {questions.map((q, idx) => {
        const isActive = q.id === activeQ
        
        if (q.type === 'section') {
          return (
            <SectionCard
              key={q.id}
              section={q}
              isActive={isActive}
              onSelect={() => setActiveQ(q.id)}
              onTitleChange={(value) => onUpdateSectionTitle(q.id, value)}
              onDescChange={(value) => onUpdateSectionDesc(q.id, value)}
              onMoveUp={() => onMoveQuestion(q.id, -1)}
              onMoveDown={() => onMoveQuestion(q.id, 1)}
              onRemove={() => onRemoveQuestion(q.id)}
            />
          )
        }
        
        return (
          <QuestionCard
            key={q.id}
            question={q}
            isActive={isActive}
            onSelect={() => setActiveQ(q.id)}
            onTitleChange={(value) => onUpdateTitle(q.id, value)}
            onChangeType={(value) => onChangeType(q.id, value)}
            onMoveUp={() => onMoveQuestion(q.id, -1)}
            onMoveDown={() => onMoveQuestion(q.id, 1)}
            onDuplicate={() => onDuplicateQuestion(q.id)}
            onRemove={() => onRemoveQuestion(q.id)}
            onToggleRequired={(value) => onToggleRequired(q.id, value)}
            onUpdateOption={(idx, value) => onUpdateOption(q.id, idx, value)}
            onAddOption={() => onAddOption(q.id)}
            onRemoveOption={(idx) => onRemoveOption(q.id, idx)}
            onUpdateScale={(key, value) => onUpdateScale(q.id, key, value)}
            onUpdateFileTypes={(preset) => onUpdateFileTypes(q.id, preset)}
            onAddGridRow={() => onAddGridRow(q.id)}
            onRemoveGridRow={(idx) => onRemoveGridRow(q.id, idx)}
            onUpdateGridRow={(idx, value) => onUpdateGridRow(q.id, idx, value)}
            onAddGridCol={() => onAddGridCol(q.id)}
            onRemoveGridCol={(idx) => onRemoveGridCol(q.id, idx)}
            onUpdateGridCol={(idx, value) => onUpdateGridCol(q.id, idx, value)}
          />
        )
      })}
    </div>
  )
}

export default QuestionsContainer