import type { Document } from '../lib/types'
import { getExpiryStatus, statusColor, statusLabel } from '../lib/types'

export function DocumentCard({
  doc,
  onDelete,
  onDownload,
}: {
  doc: Document
  onDelete?: (doc: Document) => void
  onDownload?: (doc: Document) => void
}) {
  const status = getExpiryStatus(doc.expiry_date)

  return (
    <div className="flex items-center gap-3 bg-white border border-charcoal/10 rounded-lg px-4 py-3">
      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor[status]}`} title={statusLabel[status]} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm text-charcoal truncate">{doc.name}</p>
        <p className="text-xs text-charcoal/50 font-mono mt-0.5">
          {doc.category}
          {doc.expiry_date && ` · expires ${doc.expiry_date}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onDownload && (
          <button
            onClick={() => onDownload(doc)}
            className="text-xs font-medium text-hazard hover:text-hazard-light px-2 py-1"
          >
            Download
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(doc)}
            className="text-xs font-medium text-charcoal/40 hover:text-expired px-2 py-1"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
