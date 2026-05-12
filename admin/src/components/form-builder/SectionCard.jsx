import React from 'react'
import { LayoutList, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'

const SectionCard = ({ 
  section, 
  isActive, 
  onSelect, 
  onTitleChange, 
  onDescChange, 
  onMoveUp, 
  onMoveDown, 
  onRemove 
}) => {
  return (
    <div 
      className={`rounded-2xl border border-slate-200 bg-white p-5 fade-in ${isActive ? 'ring-2 ring-[#6C5CE7]/30 border-[#6C5CE7]' : 'shadow-sm hover:shadow-md'}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 mb-3">
        <LayoutList style={{ width: 20, height: 20, color: '#64748b' }} />
        <div className="flex-1">
          <input 
            className={`w-full bg-transparent text-base font-semibold text-[#202124] border-b-2 ${isActive ? 'border-slate-400' : 'border-transparent hover:border-slate-200'} pb-1 transition-colors focus:outline-none`}
            value={section.title} 
            placeholder="Tên section" 
            onChange={(e) => onTitleChange(e.target.value)} 
            onClick={(e) => e.stopPropagation()}
          />
          <input 
            className="w-full bg-transparent text-sm text-slate-500 border-b border-transparent hover:border-slate-200 pb-1 mt-1 transition-colors focus:outline-none focus:border-[#6C5CE7]"
            value={section.description || ''} 
            placeholder="Mô tả (tùy chọn)" 
            onChange={(e) => onDescChange(e.target.value)} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      {isActive && (
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 mt-2">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400" title="Di chuyển lên">
            <ArrowUp style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400" title="Di chuyển xuống">
            <ArrowDown style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 ml-auto" title="Xóa">
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}
    </div>
  )
}

export default SectionCard