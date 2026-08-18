import { useState, type FormEvent } from 'react'
import { CATEGORIES } from '../lib/types'

export function UploadForm({
  onUpload,
  uploading,
}: {
  onUpload: (args: { file: File; name: string; category: string; expiryDate: string }) => void
  uploading: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[9]) // General
  const [expiryDate, setExpiryDate] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    onUpload({ file, name: name || file.name, category, expiryDate })
    setFile(null)
    setName('')
    setExpiryDate('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-charcoal/10 rounded-lg p-4 flex flex-col gap-3"
    >
      <p className="font-display font-bold text-lg text-charcoal">Add a document</p>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm text-charcoal/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-concrete file:text-charcoal file:text-xs file:font-medium hover:file:bg-concrete-dark file:cursor-pointer cursor-pointer"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Document name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-charcoal/15 bg-concrete/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hazard"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-charcoal/15 bg-concrete/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hazard"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-charcoal/50 mb-1.5">
          Expiry date (optional)
        </span>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="rounded-md border border-charcoal/15 bg-concrete/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hazard"
        />
      </label>
      <button
        type="submit"
        disabled={!file || uploading}
        className="self-start bg-charcoal hover:bg-charcoal-light text-white text-sm font-medium rounded-md px-4 py-2 transition disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Upload document'}
      </button>
    </form>
  )
}
