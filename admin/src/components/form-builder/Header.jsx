import React from 'react'
import { FileText } from 'lucide-react'

const Header = ({ title, description }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#6C5CE7] flex items-center justify-center shadow-sm">
        <FileText style={{ width: 20, height: 20, color: '#fff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-[#202124] truncate">
          {title || 'Biểu mẫu không tiêu đề'}
        </h1>
        <p className="text-xs text-slate-500 truncate">
          {description || 'Tạo biểu mẫu động'}
        </p>
      </div>
      </div>
    </header>
  )
}

export default Header