import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function ShareLinkPanel({
  token,
  onGenerate,
  generating,
}: {
  token: string | null
  onGenerate: () => void
  generating: boolean
}) {
  const [copied, setCopied] = useState(false)
  const url = token ? `${window.location.origin}/w/${token}` : null

  function copy() {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-charcoal text-concrete rounded-lg p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-hazard/20" />
      <p className="font-display font-bold text-lg relative">Share your wallet</p>
      <p className="text-concrete/60 text-xs mt-0.5 relative">
        Send this to an employer or site admin for a read-only view
      </p>

      {!url ? (
        <button
          onClick={onGenerate}
          disabled={generating}
          className="mt-4 bg-hazard hover:bg-hazard-light text-white text-sm font-medium rounded-md px-4 py-2 transition disabled:opacity-50 relative"
        >
          {generating ? 'Generating…' : 'Generate share link'}
        </button>
      ) : (
        <div className="mt-4 flex items-center gap-4 relative">
          <div className="bg-white p-2 rounded-md shrink-0">
            <QRCodeSVG value={url} size={88} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs text-concrete/80 truncate mb-2">{url}</p>
            <button
              onClick={copy}
              className="bg-white/10 hover:bg-white/20 text-xs font-medium rounded-md px-3 py-1.5 transition"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
