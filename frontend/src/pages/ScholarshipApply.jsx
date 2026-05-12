import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useScholarship } from "../context/ScholarshipContext";
import { ArrowLeft, ArrowRight, Trash2, UploadCloud, CheckCircle } from "lucide-react";

// Helper function để escape HTML
const escH = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper function để get file accept string
const getFileAccept = (types) => {
  if (!types || !types.length) return '';
  const mimeMap = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'zip': 'application/zip',
  };
  return types.map(t => mimeMap[t.toLowerCase()] || `${t}`).join(',');
};

function FieldRenderer({ question, value, onChange }) {
  const q = question;
  const answer = value;
  const fileInputRef = useRef(null);
  const isChecked = (val) => {
    if (q.type === 'multiple') return answer?.value === val;
    if (q.type === 'checkbox') return Array.isArray(answer) && answer.includes(val);
    return false;
  };

  const clearFile = (index) => {
    if (index !== undefined && Array.isArray(answer)) {
      const updated = answer.filter((_, i) => i !== index);
      onChange(q.id, updated.length > 0 ? updated : null);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onChange(q.id, null);
    }
  };

  switch (q.type) {
    case 'short':
      return (
        <input
          type="text"
          className="w-full border-b border-slate-200 py-2 text-sm bg-transparent focus:outline-none focus:border-blue-600 transition-colors"
          placeholder="Câu trả lời của bạn"
          value={answer || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );
    case 'paragraph':
      return (
        <textarea
          className="w-full border-b border-slate-200 py-2 text-sm bg-transparent resize-none focus:outline-none focus:border-blue-600 transition-colors"
          rows="3"
          placeholder="Câu trả lời của bạn"
          value={answer || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );
    case 'multiple':
      return (
        <div className="space-y-2">
          {q.options && q.options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={`q_${q.id}`}
                value={opt}
                checked={isChecked(opt)}
                onChange={() => onChange(q.id, { value: opt })}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{escH(opt)}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {q.options && q.options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                value={opt}
                checked={isChecked(opt)}
                onChange={(e) => {
                  const current = Array.isArray(answer) ? answer : [];
                  const next = e.target.checked
                    ? [...current, opt]
                    : current.filter((item) => item !== opt);
                  onChange(q.id, next);
                }}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{escH(opt)}</span>
            </label>
          ))}
        </div>
      );
    case 'multiple_grid':
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600"></th>
                {q.columns && q.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 text-left font-medium text-slate-600">{escH(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.rows && q.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-4 py-2 font-medium text-slate-700">{escH(row)}</td>
                  {q.columns && q.columns.map((col, cidx) => (
                    <td key={cidx} className="px-4 py-2 text-center">
                      <input
                        type="radio"
                        name={`grid_${q.id}_${row}`}
                        value={col}
                        checked={answer?.rows?.[row] === col}
                        onChange={() => onChange(q.id, { rows: { ...(answer?.rows || {}), [row]: col } })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'checkbox_grid':
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600"></th>
                {q.columns && q.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 text-left font-medium text-slate-600">{escH(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.rows && q.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-4 py-2 font-medium text-slate-700">{escH(row)}</td>
                  {q.columns && q.columns.map((col, cidx) => {
                    const val = `${row}|${col}`;
                    const checked = Array.isArray(answer) && answer.includes(val);
                    return (
                      <td key={cidx} className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          value={val}
                          checked={checked}
                          onChange={(e) => {
                            const current = Array.isArray(answer) ? answer : [];
                            const next = e.target.checked
                              ? [...current, val]
                              : current.filter((item) => item !== val);
                            onChange(q.id, next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'dropdown':
      return (
        <select
          className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
          value={answer || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
        >
          <option value="">Chọn</option>
          {q.options && q.options.map((opt, idx) => (
            <option key={idx} value={opt}>{escH(opt)}</option>
          ))}
        </select>
      );
    case 'date':
      return (
        <input
          type="date"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
          value={answer || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );
    case 'linear':
      const nums = [];
      for (let n = q.scaleMin || 1; n <= (q.scaleMax || 5); n++) nums.push(n);
      return (
        <div className="flex flex-wrap gap-4">
          {nums.map(n => (
            <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={`linear_${q.id}`}
                value={n}
                checked={answer?.value === String(n)}
                onChange={() => onChange(q.id, { value: String(n) })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500">{n}</span>
            </label>
          ))}
        </div>
      );
    case 'file':
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor={`file_${q.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 text-sm font-medium transition-colors"
            >
              <UploadCloud size={16} />
              Chọn tệp
            </label>
            <span className="text-xs text-slate-400">
              {q.fileTypes && q.fileTypes.length ? q.fileTypes.join(', ') : 'Bất kỳ loại tệp'}
            </span>
            <input
              ref={fileInputRef}
              id={`file_${q.id}`}
              type="file"
              multiple
              className="hidden"
              accept={q.fileTypes && q.fileTypes.length ? getFileAccept(q.fileTypes) : ''}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  const filesList = files.map(file => ({
                    file,
                    fileName: file.name,
                    size: file.size,
                    fileType: file.type,
                  }));
                  onChange(q.id, filesList);
                } else {
                  onChange(q.id, null);
                }
              }}
            />
            {answer && Array.isArray(answer) && answer.length > 0 && (
              <button
                type="button"
                onClick={() => clearFile()}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
              >
                <Trash2 size={14} />
                Xóa tất cả
              </button>
            )}
          </div>
          {answer && Array.isArray(answer) && answer.length > 0 && (
            <div className="space-y-2">
              {answer.map((file, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{file.fileName}</p>
                      {file.size ? <p className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB</p> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => clearFile(idx)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    default:
      return (
        <input
          type="text"
          className="w-full border-b border-slate-200 py-2 text-sm bg-transparent focus:outline-none focus:border-blue-600 transition-colors"
          placeholder="Câu trả lời"
          value={answer || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );
  }
}

function ScholarshipApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScholarshipById, getApplicationByScholarship, getScholarshipForm, submitApplication } = useScholarship();

  const scholarship = getScholarshipById(id);
  const existingApplication = getApplicationByScholarship(id);
  const [form, setForm] = useState(() => getScholarshipForm(id) || { title: '', description: '', fields: [] });
  const failingReviews = (existingApplication?.reviewDetails || []).filter((r) => !r.is_pass);

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(getScholarshipForm(id) || { title: '', description: '', fields: [] });
  }, [id, getScholarshipForm]);

  // Initialize answers from existing application once (do not refetch form when applications list updates)
  useEffect(() => {
    if (!existingApplication) return;
    // Only initialize if answers are empty to avoid clobbering user edits
    if (Object.keys(answers).length === 0 && existingApplication?.latestSubmission?.data_json) {
      const dataJson = existingApplication.latestSubmission.data_json;
      const parsed = typeof dataJson === 'string'
        ? (() => {
            try {
              return JSON.parse(dataJson);
            } catch {
              return {};
            }
          })()
        : dataJson;
      setAnswers(parsed || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingApplication]);

  // Gom nhóm câu hỏi theo section
  useEffect(() => {
    const formQuestions = form.questions || form.fields || [];

    if (!formQuestions.length) {
      setSteps([]);
      return;
    }

    const newSteps = [];
    let currentSection = null;
    
    formQuestions.forEach(q => {
      if (q.type === 'section') {
        currentSection = { 
          sectionId: q.id, 
          title: q.title, 
          description: q.description, 
          questions: [] 
        };
        newSteps.push(currentSection);
      } else {
        if (!currentSection) {
          currentSection = { 
            sectionId: null, 
            title: '', 
            description: '', 
            questions: [] 
          };
          newSteps.push(currentSection);
        }
        currentSection.questions.push(q);
      }
    });
    
    setSteps(newSteps);
    setCurrentStep(0);
  }, [form.fields, form.questions, form.title, form.description, getScholarshipForm, id]);

  // Handlers
  const handleInputChange = (qId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [qId]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    const allQuestions = steps.flatMap(s => s.questions);
    const unanswered = allQuestions.filter(q => q.required && (!answers[q.id] || answers[q.id] === '')).map(q => q.title);
    
    if (unanswered.length > 0) {
      toast.error(`Vui lòng trả lời: ${unanswered.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitApplication(id, answers);
      if (result) {
        toast.success('Nộp hồ sơ thành công!');
        navigate('/my-applications', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formQuestions = form.questions || form.fields || [];

  if (!formQuestions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="text-lg font-semibold">Admin chưa cấu hình form cho học bổng này</div>
        <Link to="/" className="text-blue-600 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const currentStepData = steps[currentStep] || {};
  const currentQuestions = currentStepData.questions || [];

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{escH(form.title)}</h1>
          {form.description && <p className="text-slate-600">{escH(form.description)}</p>}
        </div>

        {/* Progress */}
        {steps.length > 0 && (
          <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600">
              Bước {currentStep + 1} / {steps.length}
            </div>
          </div>
        )}

        {/* Form */}
        {failingReviews && failingReviews.length > 0 && existingApplication?.trangthai === 'need_edit' ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div>
              <p className="text-sm font-semibold text-amber-800">Yêu cầu chỉnh sửa hồ sơ</p>
              <p className="mt-1 text-sm text-amber-700">Các mục sau chưa đạt:</p>
              <ul className="mt-2 space-y-2 text-sm text-amber-800">
                {failingReviews.map((review) => (
                  <li key={review.id_review} className="rounded bg-amber-100 p-2">
                    <div className="font-semibold">Câu hỏi: {review.field_label || review.field_key || 'Câu hỏi không xác định'}</div>
                    {review.student_answer && (
                      <div className="mt-1 text-xs text-amber-700">Trả lời: {review.student_answer}</div>
                    )}
                    {review.lydo && (
                      <div className="mt-1 text-xs text-amber-700">Nhận xét: {review.lydo}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="bg-slate-50 rounded-lg p-6 mb-8">
          {currentStepData.title && (
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{escH(currentStepData.title)}</h2>
          )}
          {currentStepData.description && (
            <p className="text-slate-600 mb-6">{escH(currentStepData.description)}</p>
          )}

          <div className="space-y-8">
            {currentQuestions.map((q) => (
              <div key={q.id} className="bg-white p-6 rounded-lg border border-slate-200">
                <label className="block text-lg font-semibold text-slate-900 mb-4">
                  {escH(q.title)}
                  {q.required && <span className="text-red-500">*</span>}
                </label>
                {q.description && (
                  <p className="text-xs text-slate-500 mb-4">{escH(q.description)}</p>
                )}
                <FieldRenderer 
                  question={q}
                  value={answers[q.id]}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Tiếp theo <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang gửi...' : existingApplication?.trangthai === 'need_edit' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScholarshipApply;
