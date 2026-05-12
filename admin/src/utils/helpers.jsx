export function uid() {
  return 'q' + Date.now() + Math.random().toString(36).slice(2, 7)
}

export const TYPES = [
  { value: 'short', label: 'Trả lời ngắn', icon: 'type' },
  { value: 'paragraph', label: 'Đoạn văn', icon: 'align-left' },
  { value: 'multiple', label: 'Trắc nghiệm', icon: 'circle-dot' },
  { value: 'checkbox', label: 'Hộp kiểm', icon: 'check-square' },
  { value: 'dropdown', label: 'Menu thả xuống', icon: 'chevron-down' },
  { value: 'date', label: 'Ngày', icon: 'calendar' },
  { value: 'linear', label: 'Thang đo', icon: 'sliders' },
  { value: 'file', label: 'Tải lên tệp', icon: 'upload-cloud' },
  { value: 'multiple_grid', label: 'Lưới trắc nghiệm', icon: 'grid-3x3' },
  { value: 'checkbox_grid', label: 'Lưới hộp kiểm', icon: 'grid-2x2' },
]

export const defaultQuestion = {
  id: '',
  title: '',
  type: 'short',
  required: false,
  options: ['Tùy chọn 1'],
  scaleMin: 1,
  scaleMax: 5,
  rows: ['Hàng 1'],
  columns: ['Cột 1'],
  fileTypes: []
}

export const defaultSection = {
  id: '',
  type: 'section',
  title: 'Tên section',
  description: ''
}

export function escH(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function getFileAccept(types) {
  const map = {
    'PDF': '.pdf',
    'JPG': '.jpg,.jpeg',
    'PNG': '.png',
    'GIF': '.gif',
    'DOCX': '.docx',
    'DOC': '.doc',
    'TXT': '.txt',
    'XLSX': '.xlsx',
    'XLS': '.xls',
    'CSV': '.csv'
  }
  return types.map(t => map[t] || '').filter(Boolean).join(',')
}