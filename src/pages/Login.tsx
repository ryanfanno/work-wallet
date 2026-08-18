import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout, FormField } from '../components/AuthLayout'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your Work Wallet">
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-expired mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-hazard hover:bg-hazard-light text-white font-medium text-sm rounded-md py-2.5 transition disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-charcoal/60 mt-5 text-center">
        No wallet yet?{' '}
        <Link to="/register" className="text-hazard font-medium hover:text-hazard-light">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
