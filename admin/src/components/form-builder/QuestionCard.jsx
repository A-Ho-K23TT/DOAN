import React from 'react'
import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react'
import OptionsEditor from './OptionsEditor'
import GridEditor from './GridEditor'
import LinearScaleEditor from './LinearScaleEditor'
import FileTypeEditor from './FileTypeEditor'
import { TYPES } from '../../utils/helpers'

const QuestionCard = ({ 
  question, 
  isActive, 
  onSelect, 
  onTitleChange, 
  onChangeType, 
  onMoveUp, 
  onMoveDown, 
  onDuplicate, 
  onRemove, 
  onToggleRequired,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onUpdateScale,
  onUpdateFileTypes,
  onAddGridRow,
  onRemoveGridRow,
  onUpdateGridRow,
  onAddGridCol,
  onRemoveGridCol,
  onUpdateGridCol
}) => {
  
  const renderOptionsEditor = () => {
    if (['multiple', 'checkbox', 'dropdown'].includes(question.type)) {
      return (
        <OptionsEditor 
          type={question.type}
          options={question.options}
          onUpdateOption={onUpdateOption}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      )
    }
    
    if (['multiple_grid', 'checkbox_grid'].includes(question.type)) {
      return (
        <GridEditor 
          type={question.type}
          rows={question.rows}
          columns={question.columns}
          onAddRow={onAddGridRow}
          onRemoveRow={onRemoveGridRow}
          onUpdateRow={onUpdateGridRow}
          onAddCol={onAddGridCol}
          onRemoveCol={onRemoveGridCol}
          onUpdateCol={onUpdateGridCol}
        />
      )
    }
    
    if (question.type === 'short') {
      return <div className="border-b border-slate-200 text-sm text-slate-300 py-2 w-2/3">Văn bản trả lời ngắn</div>
    }
    
    if (question.type === 'paragraph') {
      return <div className="border-b border-slate-200 text-sm text-slate-300 py-2 w-full">Văn bản trả lời dài</div>
    }
    
    if (question.type === 'date') {
      return (
        <div className="border border-slate-200 rounded-lg text-sm text-slate-300 py-2 px-3 w-48 flex items-center gap-2">
          <span>📅</span> Ngày, tháng, năm
        </div>
      )
    }
    
    if (question.type === 'linear') {
      return <LinearScaleEditor min={question.scaleMin} max={question.scaleMax} onUpdate={onUpdateScale} />
    }
    
    if (question.type === 'file') {
      return <FileTypeEditor fileTypes={question.fileTypes || []} onUpdate={onUpdateFileTypes} />
    }
    
    return null
  }
  
  return (
    <div 
      className={`question-card rounded-2xl border border-slate-200 bg-white p-5 fade-in transition-all duration-200 ${isActive ? 'active border-[#6C5CE7] shadow-[0_0_0_1px_rgba(108,92,231,1)]' : 'shadow-sm hover:shadow-md hover:border-[#6C5CE7]'}`}
      onClick={onSelect}
      style={isActive ? { borderColor: '#6C5CE7', boxShadow: '0 0 0 1px #6C5CE7' } : {}}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-4">
        <div className="min-w-0">
          <input 
            className={`w-full min-h-10.5 bg-transparent px-0 text-lg font-medium text-[#202124] border-b-2 ${isActive ? 'border-[#6C5CE7]' : 'border-transparent hover:border-slate-200'} pb-2 transition-colors focus:outline-none`}
            value={question.title} 
            placeholder="Câu hỏi" 
            onChange={(e) => onTitleChange(e.target.value)} 
            onClick={(e) => e.stopPropagation()}
            autoFocus={isActive && !question.title}
          />
        </div>
        {isActive && (
          <select 
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none focus:border-[#6C5CE7]"
            value={question.type}
            onChange={(e) => { e.stopPropagation(); onChangeType(e.target.value) }}
            onClick={(e) => e.stopPropagation()}
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="ml-0 mb-4 pl-0" onClick={(e) => e.stopPropagation()}>
        {renderOptionsEditor()}
      </div>
      
      {isActive && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400" title="Di chuyển lên">
              <ArrowUp style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400" title="Di chuyển xuống">
              <ArrowDown style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate() }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400" title="Nhân bản">
              <Copy style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Xóa">
              <Trash2 style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            Bắt buộc
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={question.required} onChange={(e) => onToggleRequired(e.target.checked)} />
              <div className={`w-9 h-5 rounded-full transition-colors ${question.required ? 'bg-[#6C5CE7]' : 'bg-slate-300'}`}></div>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${question.required ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

export default QuestionCard