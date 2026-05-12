

// src/components/PreviewPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Trash2, UploadCloud, CheckCircle } from 'lucide-react';
//import { escH, getFileAccept } from '../utils/helpers';
import { escH, getFileAccept } from '../../utils/helpers';

const PreviewPanel = ({ visible, questions, formTitle, formDesc, onSubmitSuccess, onError, setSubmitting }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [answers, setAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Gom nhóm câu hỏi theo section
  useEffect(() => {
    const newSteps = [];
    let currentSection = null;
    questions.forEach(q => {
      if (q.type === 'section') {
        currentSection = { sectionId: q.id, title: q.title, description: q.description, questions: [] };
        newSteps.push(currentSection);
      } else {
        if (!currentSection) {
          currentSection = { sectionId: null, title: '', description: '', questions: [] };
          newSteps.push(currentSection);
        }
        currentSection.questions.push(q);
      }
    });
    setSteps(newSteps);
    setCurrentStep(0);
  }, [questions]);

  // Lấy câu trả lời dạng text
  const getAnswer = useCallback((q) => {
    const ans = answers[q.id];
    if (!ans) return '';
    if (q.type === 'multiple' || q.type === 'linear') return ans.value || '';
    if (q.type === 'checkbox') return Array.isArray(ans) ? ans.join(', ') : '';
    if (q.type === 'multiple_grid') {
      if (ans.rows) return Object.entries(ans.rows).map(([row, col]) => `${row}: ${col || 'chưa trả lời'}`).join('; ');
      return '';
    }
    if (q.type === 'checkbox_grid') return Array.isArray(ans) ? ans.join(', ') : '';
    if (q.type === 'file') return uploadedFiles[q.id]?.name || '';
    return ans || '';
  }, [answers, uploadedFiles]);

  // Handlers input
  const handleInputChange = (q, value) => {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  };

  const handleRadioChange = (q, value) => {
    setAnswers(prev => ({ ...prev, [q.id]: { value } }));
  };

  const handleCheckboxChange = (q, value, checked) => {
    setAnswers(prev => {
      const current = prev[q.id] || [];
      if (checked) return { ...prev, [q.id]: [...current, value] };
      return { ...prev, [q.id]: current.filter(v => v !== value) };
    });
  };

  const handleGridRadioChange = (q, row, col) => {
    setAnswers(prev => ({
      ...prev,
      [q.id]: { rows: { ...(prev[q.id]?.rows || {}), [row]: col } }
    }));
  };

  const handleGridCheckboxChange = (q, row, col, checked) => {
    const value = `${row}|${col}`;
    setAnswers(prev => {
      const current = prev[q.id] || [];
      if (checked) return { ...prev, [q.id]: [...current, value] };
      return { ...prev, [q.id]: current.filter(v => v !== value) };
    });
  };

  const handleFileChange = (q, file) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [q.id]: file }));
      setAnswers(prev => ({ ...prev, [q.id]: file.name }));
    } else {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[q.id];
        return newFiles;
      });
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[q.id];
        return newAnswers;
      });
    }
  };

  const clearAllAnswers = () => {
    setAnswers({});
    setUploadedFiles({});
  };

  const validateStep = (step) => {
    for (const q of step.questions) {
      if (!q.required) continue;
      const ans = getAnswer(q);
      if (!ans) {
        onError(`Vui lòng trả lời: "${q.title || 'Câu hỏi'}"`, true);
        return false;
      }
    }
    return true;
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const goToNextStep = async () => {
    const step = steps[currentStep];
    if (!validateStep(step)) return;
    if (currentStep === steps.length - 1) {
      await submitForm();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const submitForm = async () => {
    const allQuestions = questions.filter(q => q.type !== 'section');
    for (const q of allQuestions) {
      if (!q.required) continue;
      if (!getAnswer(q)) {
        onError(`Vui lòng trả lời: "${q.title || 'Câu hỏi'}"`, true);
        return;
      }
    }
    setSubmitting(true);
    const responses = {};
    allQuestions.forEach(q => {
      responses[q.title || q.id] = getAnswer(q);
    });
    const result = await window.dataSdk.create({
      form_title: formTitle || 'Biểu mẫu không tiêu đề',
      respondent_name: '',
      responses_json: JSON.stringify(responses),
      submitted_at: new Date().toISOString()
    });
    setSubmitting(false);
    if (result.isOk) {
      onSubmitSuccess();
      clearAllAnswers();
      setCurrentStep(0);
    } else {
      onError('Lỗi khi gửi. Vui lòng thử lại.', true);
    }
  };

  // Render từng loại câu hỏi với style đúng mẫu
  const renderQuestionField = (q) => {
    const answer = answers[q.id];
    const isChecked = (val) => {
      if (q.type === 'multiple') return answer?.value === val;
      if (q.type === 'checkbox') return Array.isArray(answer) && answer.includes(val);
      return false;
    };

    switch (q.type) {
      case 'short':
        return (
          <input
            type="text"
            className="w-full border-b border-slate-200 py-2 text-sm bg-transparent focus:outline-none focus:border-[#6C5CE7] transition-colors"
            placeholder="Câu trả lời của bạn"
            value={answer || ''}
            onChange={(e) => handleInputChange(q, e.target.value)}
          />
        );
      case 'paragraph':
        return (
          <textarea
            className="w-full border-b border-slate-200 py-2 text-sm bg-transparent resize-none focus:outline-none focus:border-[#6C5CE7] transition-colors"
            rows="3"
            placeholder="Câu trả lời của bạn"
            value={answer || ''}
            onChange={(e) => handleInputChange(q, e.target.value)}
          />
        );
      case 'multiple':
        return (
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value={opt}
                  checked={isChecked(opt)}
                  onChange={() => handleRadioChange(q, opt)}
                  className="w-4 h-4 text-[#6C5CE7] border-slate-300 focus:ring-[#6C5CE7] focus:ring-1 focus:ring-offset-0 accent-[#6C5CE7]"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{escH(opt)}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  value={opt}
                  checked={isChecked(opt)}
                  onChange={(e) => handleCheckboxChange(q, opt, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#6C5CE7] focus:ring-[#6C5CE7] focus:ring-1 focus:ring-offset-0"
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
                  {q.columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-2 text-left font-medium text-slate-600">{escH(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.rows.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-700">{escH(row)}</td>
                    {q.columns.map((col, cidx) => (
                      <td key={cidx} className="px-4 py-2 text-center">
                        <input
                          type="radio"
                          name={`grid_${q.id}_${row}`}
                          value={col}
                          checked={answer?.rows?.[row] === col}
                          onChange={() => handleGridRadioChange(q, row, col)}
                          className="w-4 h-4 text-[#6C5CE7] focus:ring-[#6C5CE7]"
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
                  {q.columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-2 text-left font-medium text-slate-600">{escH(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.rows.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-700">{escH(row)}</td>
                    {q.columns.map((col, cidx) => {
                      const val = `${row}|${col}`;
                      const checked = Array.isArray(answer) && answer.includes(val);
                      return (
                        <td key={cidx} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            value={val}
                            checked={checked}
                            onChange={(e) => handleGridCheckboxChange(q, row, col, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
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
            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            value={answer || ''}
            onChange={(e) => handleInputChange(q, e.target.value)}
          >
            <option value="">Chọn</option>
            {q.options.map((opt, idx) => (
              <option key={idx} value={opt}>{escH(opt)}</option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            value={answer || ''}
            onChange={(e) => handleInputChange(q, e.target.value)}
          />
        );
      case 'linear':
        const nums = [];
        for (let n = q.scaleMin; n <= q.scaleMax; n++) nums.push(n);
        return (
          <div className="flex flex-wrap gap-4">
            {nums.map(n => (
              <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`linear_${q.id}`}
                  value={n}
                  checked={answer?.value === String(n)}
                  onChange={() => handleRadioChange(q, String(n))}
                  className="w-4 h-4 text-[#6C5CE7] focus:ring-[#6C5CE7]"
                />
                <span className="text-xs text-slate-500">{n}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        const file = uploadedFiles[q.id];
        const ftHint = q.fileTypes?.length ? q.fileTypes.join(', ') : 'Bất kỳ loại tệp';
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label
                htmlFor={`file_${q.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#F0EDFF] text-[#6C5CE7] rounded-lg cursor-pointer hover:bg-[#E8E0FF] text-sm font-medium transition-colors"
              >
                <UploadCloud size={16} />
                Chọn tệp
              </label>
              <span className="text-xs text-slate-400">{ftHint}</span>
              <input
                id={`file_${q.id}`}
                type="file"
                className="hidden"
                accept={q.fileTypes?.length ? getFileAccept(q.fileTypes) : ''}
                onChange={(e) => handleFileChange(q, e.target.files[0])}
              />
            </div>
            {file && (
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                {file.name}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  if (steps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-[#2D3047]">{formTitle || 'Biểu mẫu không tiêu đề'}</h2>
          <p className="text-sm text-slate-500 mt-1">{formDesc}</p>
          <div className="mt-8 text-center text-slate-400">Chưa có câu hỏi nào</div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-[#2D3047]">{formTitle || 'Biểu mẫu không tiêu đề'}</h2>
        <p className="text-sm text-slate-500 mt-1">{formDesc}</p>
      </div>

      <div className="space-y-4">
        {/* Section header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          {step.title && (
            <>
              <h3 className="text-xl font-semibold text-[#2D3047]">{escH(step.title)}</h3>
              {step.description && <p className="text-sm text-slate-500 mt-1">{escH(step.description)}</p>}
            </>
          )}
          <div className="text-xs text-slate-400 mt-3 flex justify-between items-center">
            <span>Bước {currentStep + 1} / {steps.length}</span>
            {step.title && <span className="text-[#6C5CE7]">●</span>}
          </div>
        </div>

        {/* Các câu hỏi trong step */}
        {step.questions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 fade-in">
            <div className="mb-4">
              <label className="font-medium text-[#2D3047]">
                {escH(q.title) || 'Câu hỏi'}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {renderQuestionField(q)}
          </div>
        ))}

        {/* Nút điều hướng */}
        <div className="flex items-center justify-between gap-4 pt-4 pb-8">
          <div className="flex gap-3">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button
              onClick={clearAllAnswers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Trash2 size={16} />
              Xóa hết
            </button>
          </div>
          <button
            onClick={goToNextStep}
            className="flex items-center gap-2 px-6 py-2 bg-[#6C5CE7] text-white rounded-lg text-sm font-medium hover:bg-[#5A4BD1] transition-colors shadow-sm"
          >
            {currentStep === steps.length - 1 ? 'Gửi' : 'Tiếp tục'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;