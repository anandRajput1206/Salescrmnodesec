import { useEffect, useRef, useState, type DragEvent } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { parseUploadFile } from '../lib/excelParser'
import { saveUpload } from '../lib/dataService'
import type { ParsedSalesRow, User } from '../lib/types'

interface UploadPageProps {
  user: User
  onSuccess: () => void
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function UploadPage({ user, onSuccess }: UploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedSalesRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [toast, setToast] = useState<{ title: string; type: 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleFileChange(file: File | null) {
    if (!file) return

    if (!isAcceptedFile(file)) {
      setError('Please upload an Excel or CSV file (.xlsx, .xls, .csv).')
      return
    }

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

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0] ?? null
    void handleFileChange(file)
  }

  async function handleUpload() {
    if (parsedRows.length === 0) {
      setError('No valid rows found. Use the CyberSecurity Sales template.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await saveUpload(user, fileName, parsedRows)
      setToast({
        title: result.isDuplicate ? 'Duplicate sheet' : 'Upload saved',
        type: 'info',
        message: result.message,
      })

      if (!result.isDuplicate) {
        window.setTimeout(() => onSuccess(), 900)
      }
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed'
      setError(message)
      setToast({ title: 'Upload failed', type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      {toast ? (
        <div className={`app-toast app-toast-${toast.type}`} role="status">
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="app-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <header className="page-header">
        <div>
          <p className="eyebrow">Upload</p>
          <h4>Upload Sales Data</h4>
          <p className="muted">
            Every upload is kept in history. New data becomes Latest; the same sheet is saved as Duplicate.
          </p>
        </div>
      </header>

      <div className="upload-panel">
        <div
          className={`upload-box${isDragging ? ' upload-box-dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
          }}
        >
          <FileSpreadsheet size={32} />
          <p>{fileName || (isDragging ? 'Drop file here' : 'Drag & drop or click to choose file')}</p>
          <span>Sheet name: Sales_Data_Entry · Accepts .xlsx, .xls, .csv</span>
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
          onClick={() => void handleUpload()}
        >
          <Upload size={16} />
          {loading ? 'Uploading...' : 'Upload to dashboard'}
        </button>
      </div>
    </div>
  )
}
