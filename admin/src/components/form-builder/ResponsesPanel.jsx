import React from 'react'
import { Inbox } from 'lucide-react'

const ResponsesPanel = ({ visible, responseCount }) => {
  if (!visible) return null
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0EDFF] flex items-center justify-center mx-auto mb-4">
          <Inbox style={{ width: 28, height: 28, color: '#6C5CE7' }} />
        </div>
        <p className="text-lg font-bold text-[#2D3047]">{responseCount} phản hồi</p>
        <p className="text-sm text-slate-400 mt-1">Phản hồi được lưu vào Canva Sheet</p>
      </div>
    </div>
  )
}

export default ResponsesPanel