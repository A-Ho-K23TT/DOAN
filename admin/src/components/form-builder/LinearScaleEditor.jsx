import React from 'react'

const LinearScaleEditor = ({ min, max, onUpdate }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <select 
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-[#6C5CE7]"
        value={min}
        onChange={(e) => onUpdate('min', e.target.value)}
      >
        {[0, 1].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <span>đến</span>
      <select 
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-[#6C5CE7]"
        value={max}
        onChange={(e) => onUpdate('max', e.target.value)}
      >
        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  )
}

export default LinearScaleEditor