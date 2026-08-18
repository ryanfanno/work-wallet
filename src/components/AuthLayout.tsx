import type { ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-concrete px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
            <span className="font-display font-bold uppercase tracking-wide text-sm text-charcoal/70">
              Work Wallet
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-charcoal">{title}</h1>
          <p className="text-charcoal/60 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-lg border border-charcoal/10 shadow-sm p-6">{children}</div>
      </div>
    </div>
  )
}

export function FormField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium uppercase tracking-wide text-charcoal/60 mb-1.5">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-charcoal/15 bg-concrete/40 px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-hazard focus:border-hazard transition"
      />
    </label>
  )
}
