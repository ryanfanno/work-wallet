import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import type { Document } from '../lib/types'
import { DocumentCard } from '../components/DocumentCard'
import { UploadForm } from '../components/UploadForm'
import { ShareLinkPanel } from '../components/ShareLinkPanel'

export function Dashboard() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadDocuments()
    loadShareLink()
  }, [user])

  async function loadDocuments() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
    if (fetchError) setError(fetchError.message)
    setDocuments(data ?? [])
    setLoading(false)
  }

  async function loadShareLink() {
    const { data } = await supabase
      .from('share_links')
      .select('public_token')
      .eq('active', true)
      .limit(1)
      .maybeSingle()
    if (data) setShareToken(data.public_token)
  }

  async function handleUpload({
    file,
    name,
    category,
    expiryDate,
  }: {
    file: File
    name: string
    category: string
    expiryDate: string
  }) {
    if (!user) return
    setUploading(true)
    setError(null)

    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { error: insertError } = await supabase.from('documents').insert({
      user_id: user.id,
      name,
      category,
      storage_path: path,
      expiry_date: expiryDate || null,
    })

    if (insertError) setError(insertError.message)

    setUploading(false)
    loadDocuments()
  }

  async function handleDelete(doc: Document) {
    await supabase.storage.from('documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    loadDocuments()
  }

  async function handleDownload(doc: Document) {
    const { data, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)
    if (signError || !data) {
      setError('Could not create a download link')
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  async function handleGenerateLink() {
    if (!user) return
    setGenerating(true)
    const { data, error: linkError } = await supabase
      .from('share_links')
      .insert({ user_id: user.id })
      .select('public_token')
      .single()
    if (linkError) {
      setError(linkError.message)
    } else if (data) {
      setShareToken(data.public_token)
    }
    setGenerating(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-concrete">
      <header className="border-b border-charcoal/10 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
            <span className="font-display font-bold uppercase tracking-wide text-sm">Work Wallet</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-medium text-charcoal/50 hover:text-charcoal">
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <ShareLinkPanel token={shareToken} onGenerate={handleGenerateLink} generating={generating} />

        <UploadForm onUpload={handleUpload} uploading={uploading} />

        {error && (
          <p className="text-sm text-expired bg-expired/10 border border-expired/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <p className="font-display font-bold text-lg text-charcoal mb-3">
            Your documents {documents.length > 0 && `(${documents.length})`}
          </p>
          {loading ? (
            <p className="text-sm text-charcoal/50">Loading…</p>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-charcoal/50 text-sm bg-white border border-dashed border-charcoal/15 rounded-lg">
              No documents yet. Upload your first ticket, licence, or certificate above.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
