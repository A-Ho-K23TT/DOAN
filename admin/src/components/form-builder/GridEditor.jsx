import React from 'react'
import { Plus, X } from 'lucide-react'

const GridEditor = ({ type, rows, columns, onAddRow, onRemoveRow, onUpdateRow, onAddCol, onRemoveCol, onUpdateCol }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Hàng</div>
        {rows.map((row, idx) => (
          <div key={idx} className="option-row flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
            <input 
              className="flex-1 bg-transparent py-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-[#6C5CE7] focus:outline-none"
              value={row} 
              onChange={(e) => onUpdateRow(idx, e.target.value)}
            />
            <button className="remove-opt text-slate-300 hover:text-red-400 transition-colors" onClick={() => onRemoveRow(idx)}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
        <button className="mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#6C5CE7] hover:bg-[#F0EDFF]" onClick={onAddRow}>
          <Plus style={{ width: 14, height: 14 }} /> Thêm hàng
        </button>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cột</div>
        {columns.map((col, idx) => (
          <div key={idx} className="option-row flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
            <input 
              className="flex-1 bg-transparent py-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-[#6C5CE7] focus:outline-none"
              value={col} 
              onChange={(e) => onUpdateCol(idx, e.target.value)}
            />
            <button className="remove-opt text-slate-300 hover:text-red-400 transition-colors" onClick={() => onRemoveCol(idx)}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
        <button className="mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#6C5CE7] hover:bg-[#F0EDFF]" onClick={onAddCol}>
          <Plus style={{ width: 14, height: 14 }} /> Thêm cột
        </button>
      </div>
    </div>
  )
}

export default GridEditor