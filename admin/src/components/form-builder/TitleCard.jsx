import React from 'react'

const TitleCard = ({ title, description, onTitleChange, onDescChange }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-1.5 w-24 rounded-full bg-[#6C5CE7] mb-4"></div>
      <input 
        className="w-full bg-transparent text-2xl font-semibold tracking-tight text-[#202124] border-b-2 border-slate-200 pb-2 mb-2 focus:outline-none focus:border-[#6C5CE7]"
        value={title} 
        placeholder="Tiêu đề biểu mẫu" 
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <input 
        className="w-full bg-transparent text-sm text-slate-500 border-b border-slate-100 pb-1 focus:outline-none focus:border-[#6C5CE7]"
        value={description} 
        placeholder="Mô tả biểu mẫu" 
        onChange={(e) => onDescChange(e.target.value)}
      />
    </div>
  )
}

export default TitleCard