import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { parseUploadFile } from '../lib/excelParser'
import { saveUpload } from '../lib/dataService'
import type { ParsedSalesRow, User } from '../lib/types'

interface UploadPageProps {
  user: User
  onSuccess: () => void
}

export function UploadPage({ user, onSuccess }: UploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedSalesRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(file: File | null) {
    if (!file) return

    setError('')
    setWarnings([])
    setParsedRows([])
    setFileName(file.name)

    try {
      const buffer = await file.arrayBuffer()
      const result = parseUploadFile(buffer, file.name)
      setWarnings(result.warnings)
      setParsedRows(result.rows)
    } catch {
      setError('Could not read this file. Upload .xlsx, .xls, or .csv using the template format.')
    }
  }

  async function handleUpload() {
    if (parsedRows.length === 0) {
      setError('No valid rows found. Use the CyberSecurity Sales template.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await saveUpload(user, fileName, parsedRows)
      onSuccess()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Upload</p>
          <h4>Upload Sales Data</h4>
          <p className="muted">
            Upload the CyberSecurity Sales template. Your previous upload will be replaced.
          </p>
        </div>
      </header>

      <div className="upload-panel">
        <div className="upload-box" onClick={() => inputRef.current?.click()}>
          <FileSpreadsheet size={32} />
          <p>{fileName || 'Choose Excel or CSV file'}</p>
          <span>Sheet name: Sales_Data_Entry · Same columns as the downloadable template</span>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
        </div>

        {parsedRows.length > 0 ? (
          <div className="upload-summary">
            <strong>{parsedRows.length} rows ready to upload</strong>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <ul className="warning-list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <button
          type="button"
          className="primary-btn"
          disabled={loading || parsedRows.length === 0}
          onClick={handleUpload}
        >
          <Upload size={16} />
          {loading ? 'Uploading...' : 'Upload to dashboard'}
        </button>
      </div>
    </div>
  )
}
