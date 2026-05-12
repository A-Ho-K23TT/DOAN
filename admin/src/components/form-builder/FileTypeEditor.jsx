import React from 'react'

const FileTypeEditor = ({ fileTypes, onUpdate }) => {
  const getPreset = () => {
    if (fileTypes.length === 1 && fileTypes[0] === 'PDF') return 'pdf'
    if (fileTypes.includes('JPG') && fileTypes.includes('PNG') && fileTypes.includes('GIF')) return 'image'
    if (fileTypes.includes('DOCX') || fileTypes.includes('DOC') || fileTypes.includes('TXT')) return 'doc'
    if (fileTypes.includes('XLSX') || fileTypes.includes('XLS') || fileTypes.includes('CSV')) return 'sheet'
    return ''
  }
  
  const ftText = fileTypes.length ? fileTypes.join(', ') : 'Tất cả loại tệp'
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-500 py-1">Cho phép: {ftText}</div>
      <div className="flex gap-2 items-center text-xs">
        <select 
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:outline-none focus:border-[#6C5CE7]" 
          value={getPreset()}
          onChange={(e) => onUpdate(e.target.value)}
        >
          <option value="">Tất cả loại tệp</option>
          <option value="pdf">PDF</option>
          <option value="image">Hình ảnh (JPG, PNG, GIF)</option>
          <option value="doc">Tài liệu (DOCX, DOC, TXT)</option>
          <option value="sheet">Bảng tính (XLSX, XLS, CSV)</option>
        </select>
      </div>
    </div>
  )
}

export default FileTypeEditor