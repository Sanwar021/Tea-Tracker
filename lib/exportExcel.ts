type ExcelCell = string | number | boolean | Date | null | undefined

function escapeHtml(value: ExcelCell) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? '')
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character] || character))
}

export async function downloadExcel(
  rows: Array<Record<string, ExcelCell>>,
  sheetName: string,
  fileName: string
) {
  if (rows.length === 0) throw new Error('There is no data to export')

  const headers = Object.keys(rows[0])
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')
  const bodyHtml = rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`).join('')
  const htmlDocument = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(sheetName)}</title><style>table{border-collapse:collapse;font:12px Arial}th{background:#078bc8;color:#fff;font-weight:700}th,td{border:1px solid #cbdde6;padding:7px 10px;text-align:left}tr:nth-child(even){background:#f0f8fc}</style></head><body><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`
  const blob = new Blob(['\ufeff', htmlDocument], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.replace(/\.xlsx$/i, '.xls')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
