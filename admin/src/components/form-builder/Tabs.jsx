import React from 'react'
import { Edit3, Eye, BarChart2 } from 'lucide-react'

const Tabs = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'edit', label: 'Chỉnh sửa', icon: Edit3 },
    { id: 'preview', label: 'Xem trước', icon: Eye },
    { id: 'responses', label: 'Phản hồi', icon: BarChart2 },
  ]

  return (
    <div className="w-full border-b border-slate-200 bg-white/95 shrink-0">
      <div className="mx-auto flex w-full max-w-5xl">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-1.5 transition-colors ${
            currentTab === tab.id
              ? 'border-b-2 border-[#6C5CE7] text-[#6C5CE7] font-semibold'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={currentTab === tab.id ? { boxShadow: 'inset 0 -2px 0 #6C5CE7' } : { boxShadow: 'inset 0 -2px 0 transparent' }}
        >
          <tab.icon style={{ width: 16, height: 16 }} />
          {tab.label}
        </button>
      ))}
      </div>
    </div>
  )
}

export default Tabs