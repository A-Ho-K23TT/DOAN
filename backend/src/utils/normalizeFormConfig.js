const normalizeField = (field, index) => {
  const key = field.key || field.field_key || `field_${index + 1}`;
  const id = field.id || key;
  const label = field.label || field.title || field.question || key;

  return {
    id,
    key,
    title: label,
    label,
    type: field.type || field.field_type || "text",
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    rows: Array.isArray(field.rows) ? field.rows : [],
    columns: Array.isArray(field.columns) ? field.columns : [],
    fileTypes: Array.isArray(field.fileTypes) ? field.fileTypes : [],
    scaleMin: field.scaleMin ?? field.min ?? null,
    scaleMax: field.scaleMax ?? field.max ?? null,
  };
};

export const normalizeFormConfig = (rawConfig) => {
  if (!rawConfig) {
    return { title: "", description: "", fields: [] };
  }

  const source = typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;

  if (Array.isArray(source)) {
    return {
      title: "",
      description: "",
      fields: source.map((field, index) => normalizeField(field, index)),
    };
  }

  const fields = source.fields || source.questions || [];

  return {
    title: source.title || source.form_title || "",
    description: source.description || source.form_description || "",
    fields: fields.map((field, index) => normalizeField(field, index)),
  };
};

export const serializeFormConfig = (config) => {
  return {
    title: config?.title || "",
    description: config?.description || "",
    fields: Array.isArray(config?.fields) ? config.fields.map((field, index) => normalizeField(field, index)) : [],
  };
};