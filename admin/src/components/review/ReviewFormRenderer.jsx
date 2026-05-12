import ReviewField from "./ReviewField";

function ReviewFormRenderer({ fields, reviews, onChange }) {
  if (!fields.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Form chưa có câu hỏi để xét duyệt.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <ReviewField
          key={field.key}
          field={field}
          value={reviews[field.key]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

export default ReviewFormRenderer;
