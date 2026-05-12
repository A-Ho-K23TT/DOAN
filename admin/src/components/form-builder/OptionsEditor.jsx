import React from 'react'
import { Plus, X } from 'lucide-react'

const OptionsEditor = ({ type, options, onUpdateOption, onAddOption, onRemoveOption }) => {
  const getPrefix = (idx) => {
    if (type === 'multiple') return <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></span>
    if (type === 'checkbox') return <span className="w-4 h-4 rounded border-2 border-slate-300 shrink-0"></span>
    return <span className="text-xs text-slate-400 w-5">{idx+1}.</span>
  }
  
  return (
    <div className="space-y-2">
      {options.map((opt, idx) => (
        <div key={idx} className="option-row flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
          {getPrefix(idx)}
          <input 
            className="flex-1 bg-transparent py-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-[#6C5CE7] focus:outline-none"
            value={opt} 
            onChange={(e) => onUpdateOption(idx, e.target.value)}
          />
          <button 
            className="remove-opt text-slate-300 hover:text-red-400 transition-colors" 
            onClick={() => onRemoveOption(idx)}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ))}
      <button className="mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#6C5CE7] hover:bg-[#F0EDFF]" onClick={onAddOption}>
        <Plus style={{ width: 14, height: 14 }} /> Thêm tùy chọn
      </button>
    </div>
  )
}

export default OptionsEditor