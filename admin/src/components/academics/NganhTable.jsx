function NganhTable({ rows, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ten nganh</th>
            <th>Khoa</th>
            <th>Nguoi tao</th>
            <th>Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id_nganh}>
              <td>{row.id_nganh}</td>
              <td>{row.ten_nganh}</td>
              <td>{row.tenkhoa}</td>
              <td>{row.created_by ?? "-"}</td>
              <td>
                <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
                  <button type="button" className="btn btn-mini" onClick={() => onEdit?.(row)}>
                    Sua
                  </button>
                  <button type="button" className="btn btn-mini btn-danger" onClick={() => onDelete?.(row)}>
                    Xoa
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td colSpan="5" className="empty-row">
                Khong co du lieu phu hop.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default NganhTable;