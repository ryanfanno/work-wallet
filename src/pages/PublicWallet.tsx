import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Document } from '../lib/types'
import { CATEGORIES, getExpiryStatus, statusColor, statusLabel } from '../lib/types'

export function PublicWallet() {
  const { token } = useParams<{ token: string }>()
  const [documents, setDocuments] = useState<Document[] | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    load()
  }, [token])

  async function load() {
    const { data: link } = await supabase
      .from('share_links')
      .select('user_id, active')
      .eq('public_token', token)
      .eq('active', true)
      .maybeSingle()

    if (!link) {
      setNotFound(true)
      return
    }

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', link.user_id)
      .order('category')

    setDocuments(docs ?? [])
  }

  async function handleDownload(doc: Document) {
    const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-document-url`
    const res = await fetch(functionsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, documentId: doc.id }),
    })
    const body = await res.json()
    if (body.url) window.open(body.url, '_blank')
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete px-4">
        <p className="text-charcoal/60 text-sm">This share link isn't active or doesn't exist.</p>
      </div>
    )
  }

  if (!documents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete">
        <p className="text-charcoal/40 text-sm">Loading wallet…</p>
      </div>
    )
  }

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    docs: documents.filter((d) => d.category === cat),
  })).filter((g) => g.docs.length > 0)

  return (
    <div className="min-h-screen bg-concrete py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Signature element: laminated compliance-card header */}
        <div className="relative bg-charcoal text-concrete rounded-2xl p-6 punch-hole overflow-hidden mb-6">
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-concrete/20 border border-concrete/30" />
          <p className="text-xs uppercase tracking-widest text-concrete/50 font-medium">
            Compliance Passport
          </p>
          <p className="font-display font-extrabold text-3xl mt-1">Work Wallet</p>
          <p className="text-concrete/60 text-sm mt-1">
            {documents.length} document{documents.length === 1 ? '' : 's'} on file · read-only view
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="font-display font-bold text-sm uppercase tracking-wide text-charcoal/50 mb-2">
                {group.category}
              </p>
              <div className="flex flex-col gap-2">
                {group.docs.map((doc) => {
                  const status = getExpiryStatus(doc.expiry_date)
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 bg-white border border-charcoal/10 rounded-lg px-4 py-3"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${statusColor[status]}`}
                        title={statusLabel[status]}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-charcoal truncate">{doc.name}</p>
                        <p className="text-xs text-charcoal/50 font-mono mt-0.5">
                          {statusLabel[status]}
                          {doc.expiry_date && ` · expires ${doc.expiry_date}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-xs font-medium text-hazard hover:text-hazard-light px-2 py-1 shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <p className="text-center text-charcoal/40 text-sm py-8">No documents shared yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
