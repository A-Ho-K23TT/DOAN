import React from 'react'
import { PlusCircle, LayoutList, Save } from 'lucide-react'

const AddButtons = ({ onAddQuestion, onAddSection, onSave }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-1 pb-10">
      <button 
        onClick={onAddQuestion} 
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#202124] shadow-sm transition-colors hover:bg-slate-50 hover:border-[#6C5CE7]"
      >
        <PlusCircle style={{ width: 18, height: 18, color: '#6C5CE7' }} /> Thêm câu hỏi
      </button>
      <button 
        onClick={onAddSection} 
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#202124] shadow-sm transition-colors hover:bg-slate-50 hover:border-[#6C5CE7]"
      >
        <LayoutList style={{ width: 18, height: 18, color: '#6C5CE7' }} /> Thêm section
      </button>
      <button 
        onClick={onSave} 
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#202124] shadow-sm transition-colors hover:bg-slate-50 hover:border-[#6C5CE7]"
      >
        <Save style={{ width: 18, height: 18, color: '#6C5CE7' }} /> Lưu form
      </button>
    </div>
  )
}

export default AddButtons