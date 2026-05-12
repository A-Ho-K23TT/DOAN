import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from "../../components/form-builder/Header";
import Tabs from "../../components/form-builder/Tabs";
import EditPanel from "../../components/form-builder/EditPanel";
import PreviewPanel from "../../components/form-builder/PreviewPanel";
//import ResponsesPanel from "../../components/form-builder/ResponsesPanel";

import { uid, defaultQuestion, defaultSection } from "../../utils/helpers";
import {
  fetchFormConfigForView,
  findScholarshipByIdForView,
  saveFormConfigForView,
} from "../../services/scholarship.service";

const defaultConfig = {
  form_title: 'Biểu mẫu không tiêu đề',
  form_description: '',
  submit_button_text: 'Gửi',
  background_color: '#F0EDFF',
  surface_color: '#FFFFFF',
  text_color: '#2D3047',
  primary_action_color: '#6C5CE7',
  secondary_action_color: '#64748B',
  font_family: 'DM Sans',
  font_size: 16
};

function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [activeQ, setActiveQ] = useState(null);
  const [currentTab, setCurrentTab] = useState('edit');
  const [responseCount, setResponseCount] = useState(0);
  const [config, setConfig] = useState(defaultConfig);
  const [scholarshipName, setScholarshipName] = useState('');
  const [initializing, setInitializing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const previous = {
      backgroundColor: document.body.style.backgroundColor,
      color: document.body.style.color,
      fontFamily: document.body.style.fontFamily,
    };

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    document.body.style.backgroundColor = '#F0EDFF';
    document.body.style.color = '#202124';
    document.body.style.fontFamily = "'DM Sans', sans-serif";

    return () => {
      document.body.style.backgroundColor = previous.backgroundColor;
      document.body.style.color = previous.color;
      document.body.style.fontFamily = previous.fontFamily;
      fontLink.remove();
    };
  }, []);

  // ---------- Helper functions (giữ nguyên y hệt logic cũ) ----------
  const addQuestion = useCallback((type = 'multiple') => {
    const questionId = uid();
    const newQ = { ...defaultQuestion, id: questionId, field_key: questionId, type };
    setQuestions(prev => {
      if (activeQ) {
        const idx = prev.findIndex(x => x.id === activeQ);
        if (idx !== -1) {
          const newArr = [...prev];
          newArr.splice(idx + 1, 0, newQ);
          return newArr;
        }
      }
      return [...prev, newQ];
    });
    setActiveQ(newQ.id);
  }, [activeQ]);

  const addSection = useCallback(() => {
    const newSection = { ...defaultSection, id: uid() };
    setQuestions(prev => {
      if (activeQ) {
        const idx = prev.findIndex(x => x.id === activeQ);
        if (idx !== -1) {
          const newArr = [...prev];
          newArr.splice(idx + 1, 0, newSection);
          return newArr;
        }
      }
      return [...prev, newSection];
    });
    setActiveQ(newSection.id);
  }, [activeQ]);

  const removeQuestion = useCallback((id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setActiveQ(prev => prev === id ? (questions.length ? questions[questions.length-1]?.id : null) : prev);
  }, [questions]);

  const duplicateQuestion = useCallback((id) => {
    const src = questions.find(q => q.id === id);
    if (!src) return;
    const questionId = uid();
    const newQ = {
      ...src,
      id: questionId,
      field_key: questionId,
      title: src.title + ' (bản sao)',
      options: [...(src.options || [])],
      rows: [...(src.rows || [])],
      columns: [...(src.columns || [])],
      fileTypes: [...(src.fileTypes || [])],
    };
    const idx = questions.findIndex(q => q.id === id);
    setQuestions(prev => {
      const newArr = [...prev];
      newArr.splice(idx + 1, 0, newQ);
      return newArr;
    });
    setActiveQ(newQ.id);
  }, [questions]);

  const moveQuestion = useCallback((id, dir) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      const ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[ni]] = [newArr[ni], newArr[idx]];
      return newArr;
    });
  }, []);

  const updateTitle = useCallback((id, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, title: value } : q));
  }, []);

  const updateSectionTitle = useCallback((id, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, title: value } : q));
  }, []);

  const updateSectionDesc = useCallback((id, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, description: value } : q));
  }, []);

  const changeType = useCallback((id, newType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      const updated = { ...q, type: newType };
      if (['multiple', 'checkbox', 'dropdown'].includes(newType) && (!updated.options || !updated.options.length)) {
        updated.options = ['Tùy chọn 1'];
      }
      return updated;
    }));
  }, []);

  const updateOption = useCallback((id, idx, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, options: q.options.map((opt, i) => i === idx ? value : opt) } : q
    ));
  }, []);

  const addOption = useCallback((id) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, options: [...q.options, `Tùy chọn ${q.options.length + 1}`] } : q
    ));
  }, []);

  const removeOption = useCallback((id, idx) => {
    setQuestions(prev => prev.map(q => 
      q.id === id && q.options.length > 1 ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
    ));
  }, []);

  const toggleRequired = useCallback((id, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, required: value } : q));
  }, []);

  const updateScale = useCallback((id, key, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [key === 'min' ? 'scaleMin' : 'scaleMax']: +value } : q
    ));
  }, []);

  const updateFileTypes = useCallback((id, preset) => {
    let fileTypes = [];
    if (preset === 'pdf') fileTypes = ['PDF'];
    else if (preset === 'image') fileTypes = ['JPG', 'PNG', 'GIF'];
    else if (preset === 'doc') fileTypes = ['DOCX', 'DOC', 'TXT'];
    else if (preset === 'sheet') fileTypes = ['XLSX', 'XLS', 'CSV'];
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, fileTypes } : q));
  }, []);

  const addGridRow = useCallback((id) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, rows: [...q.rows, `Hàng ${q.rows.length + 1}`] } : q
    ));
  }, []);

  const removeGridRow = useCallback((id, idx) => {
    setQuestions(prev => prev.map(q => 
      q.id === id && q.rows.length > 1 ? { ...q, rows: q.rows.filter((_, i) => i !== idx) } : q
    ));
  }, []);

  const updateGridRow = useCallback((id, idx, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, rows: q.rows.map((row, i) => i === idx ? value : row) } : q
    ));
  }, []);

  const addGridCol = useCallback((id) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, columns: [...q.columns, `Cột ${q.columns.length + 1}`] } : q
    ));
  }, []);

  const removeGridCol = useCallback((id, idx) => {
    setQuestions(prev => prev.map(q => 
      q.id === id && q.columns.length > 1 ? { ...q, columns: q.columns.filter((_, i) => i !== idx) } : q
    ));
  }, []);

  const updateGridCol = useCallback((id, idx, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, columns: q.columns.map((col, i) => i === idx ? value : col) } : q
    ));
  }, []);

  const onFormTitleChange = useCallback((value) => {
    setConfig(prev => ({ ...prev, form_title: value }));
  }, []);

  const onFormDescChange = useCallback((value) => {
    setConfig(prev => ({ ...prev, form_description: value }));
  }, []);

  const saveFormToDatabase = useCallback(async () => {
    if (!id) {
      showToast('Thiếu ID học bổng để lưu form.', true);
      return;
    }

    const formPayload = {
      title: config.form_title,
      description: config.form_description,
      fields: questions
        .filter((question) => question.type !== 'section')
        .map((question, index) => {
          const fallbackKey = `field_${index + 1}`;
          const normalizedType = String(question.type || 'short').toLowerCase();

          return {
            id: question.id,
            field_key: String(question.field_key || question.id || fallbackKey),
            label: String(question.title || `Câu hỏi ${index + 1}`),
            type: normalizedType,
            required: Boolean(question.required),
            options: ['multiple', 'checkbox', 'dropdown'].includes(normalizedType)
              ? (Array.isArray(question.options) ? question.options : [])
              : [],
            rows: ['multiple_grid', 'checkbox_grid'].includes(normalizedType)
              ? (Array.isArray(question.rows) ? question.rows : [])
              : [],
            columns: ['multiple_grid', 'checkbox_grid'].includes(normalizedType)
              ? (Array.isArray(question.columns) ? question.columns : [])
              : [],
            fileTypes: normalizedType === 'file' ? (Array.isArray(question.fileTypes) ? question.fileTypes : []) : [],
            scaleMin: normalizedType === 'linear' ? Number(question.scaleMin ?? 1) : null,
            scaleMax: normalizedType === 'linear' ? Number(question.scaleMax ?? 5) : null,
          };
        }),
    };

    setSubmitting(true);
    try {
      await saveFormConfigForView(id, formPayload);
      showToast('Đã lưu form vào hệ thống thành công! ✓');
    } catch (error) {
      showToast(error.message || 'Lưu form thất bại. Vui lòng thử lại.', true);
    } finally {
      setSubmitting(false);
    }
  }, [config.form_description, config.form_title, id, questions]);

  const showToast = (msg, isError = false) => {
    let toastEl = document.getElementById('submit-toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = `toast fixed bottom-6 left-1/2 -translate-x-1/2 ${isError ? 'bg-red-500' : 'bg-[#2D3047]'} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50`;
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      if (toastEl) toastEl.className = 'hidden';
    }, 3000);
  };

  // ---------- SDK Integration ----------
  useEffect(() => {
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: (newConfig) => {
          setConfig(prev => ({ ...prev, ...newConfig }));
          document.body.style.backgroundColor = newConfig.background_color || defaultConfig.background_color;
          document.body.style.fontFamily = (newConfig.font_family || defaultConfig.font_family) + ', sans-serif';
          document.body.style.fontSize = (newConfig.font_size || defaultConfig.font_size) + 'px';
        },
        mapToCapabilities: (c) => ({
          recolorables: [
            { get: () => c.background_color || defaultConfig.background_color, set: (v) => window.elementSdk.setConfig({ background_color: v }) },
            { get: () => c.surface_color || defaultConfig.surface_color, set: (v) => window.elementSdk.setConfig({ surface_color: v }) },
            { get: () => c.text_color || defaultConfig.text_color, set: (v) => window.elementSdk.setConfig({ text_color: v }) },
            { get: () => c.primary_action_color || defaultConfig.primary_action_color, set: (v) => window.elementSdk.setConfig({ primary_action_color: v }) },
            { get: () => c.secondary_action_color || defaultConfig.secondary_action_color, set: (v) => window.elementSdk.setConfig({ secondary_action_color: v }) },
          ],
          borderables: [],
          fontEditable: { get: () => c.font_family || defaultConfig.font_family, set: (v) => window.elementSdk.setConfig({ font_family: v }) },
          fontSizeable: { get: () => c.font_size || defaultConfig.font_size, set: (v) => window.elementSdk.setConfig({ font_size: v }) },
        }),
        mapToEditPanelValues: (c) => new Map([
          ['form_title', c.form_title || defaultConfig.form_title],
          ['form_description', c.form_description || defaultConfig.form_description],
          ['submit_button_text', c.submit_button_text || defaultConfig.submit_button_text],
        ])
      });
    }
  }, []);

  useEffect(() => {
    if (window.dataSdk) {
      window.dataSdk.init({
        onDataChanged(data) {
          setResponseCount(data.length);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (questions.length === 0) {
      addQuestion();
    }
  }, [addQuestion, questions.length]);

  useEffect(() => {
    const mapFieldToQuestion = (field, index) => {
      const questionId = String(field.field_key || field.key || field.id || uid());
      const normalizedType = String(field.type || 'short').toLowerCase();

      return {
        ...defaultQuestion,
        id: questionId,
        field_key: questionId,
        title: String(field.label || `Câu hỏi ${index + 1}`),
        type: normalizedType,
        required: Boolean(field.required),
        options: Array.isArray(field.options) && field.options.length ? field.options : ['Tùy chọn 1'],
        rows: Array.isArray(field.rows) && field.rows.length ? field.rows : ['Hàng 1'],
        columns: Array.isArray(field.columns) && field.columns.length ? field.columns : ['Cột 1'],
        fileTypes: Array.isArray(field.fileTypes) ? field.fileTypes : [],
        scaleMin: Number(field.scaleMin ?? 1),
        scaleMax: Number(field.scaleMax ?? 5),
      };
    };

    const initPage = async () => {
      if (!id) return;

      setInitializing(true);

      try {
        const [scholarship, savedForm] = await Promise.all([
          findScholarshipByIdForView(id),
          fetchFormConfigForView(id),
        ]);

        if (scholarship?.name) {
          setScholarshipName(scholarship.name);
        }

        setConfig((prev) => ({
          ...prev,
          form_title: savedForm?.title || scholarship?.name || prev.form_title,
          form_description: savedForm?.description || prev.form_description,
        }));

        const nextQuestions = Array.isArray(savedForm?.fields) && savedForm.fields.length
          ? savedForm.fields.map(mapFieldToQuestion)
          : [];

        setQuestions(nextQuestions);
        setActiveQ(nextQuestions[0]?.id || null);
      } catch (error) {
        showToast(error.message || 'Không thể tải cấu hình form hiện tại.', true);
      } finally {
        setInitializing(false);
      }
    };

    initPage();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124]">
      <Header title={config.form_title} description={scholarshipName || config.form_description} />
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#6C5CE7] hover:text-[#6C5CE7]"
          onClick={() => navigate(`/admin/scholarships/${id}?setupStep=form`)}
        >
          Quay lại chi tiết học bổng
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5A4BD1] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={saveFormToDatabase}
          disabled={submitting || initializing}
        >
          {submitting ? 'Đang lưu...' : 'Lưu form vào form_config'}
        </button>
      </div>
      <Tabs currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="flex-1 overflow-auto">
        <EditPanel 
          visible={currentTab === 'edit'}
          formTitle={config.form_title}
          formDesc={config.form_description}
          questions={questions}
          activeQ={activeQ}
          onTitleChange={onFormTitleChange}
          onDescChange={onFormDescChange}
          onAddQuestion={addQuestion}
          onAddSection={addSection}
          onSave={saveFormToDatabase}
          onRemoveQuestion={removeQuestion}
          onDuplicateQuestion={duplicateQuestion}
          onMoveQuestion={moveQuestion}
          onUpdateTitle={updateTitle}
          onUpdateSectionTitle={updateSectionTitle}
          onUpdateSectionDesc={updateSectionDesc}
          onChangeType={changeType}
          onUpdateOption={updateOption}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onToggleRequired={toggleRequired}
          onUpdateScale={updateScale}
          onUpdateFileTypes={updateFileTypes}
          onAddGridRow={addGridRow}
          onRemoveGridRow={removeGridRow}
          onUpdateGridRow={updateGridRow}
          onAddGridCol={addGridCol}
          onRemoveGridCol={removeGridCol}
          onUpdateGridCol={updateGridCol}
          setActiveQ={setActiveQ}
        />
        <PreviewPanel 
          visible={currentTab === 'preview'}
          questions={questions}
          formTitle={config.form_title}
          formDesc={config.form_description}
          onSubmitSuccess={() => {
            setResponseCount(prev => prev + 1);
            showToast('Đã gửi phản hồi thành công! ✓');
          }}
          onError={showToast}
          setSubmitting={setSubmitting}
        />
        {/* <ResponsesPanel 
          visible={currentTab === 'responses'}
          responseCount={responseCount}
        /> */}
      </div>
      <div id="submit-toast" className="hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50"></div>
    </div>
  );
}

export default FormBuilderPage;