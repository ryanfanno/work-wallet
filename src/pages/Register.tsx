import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout, FormField } from '../components/AuthLayout'

export function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      navigate('/dashboard')
    } else {
      // Email confirmation is on for the Supabase project
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="Almost there">
        <p className="text-sm text-charcoal/70">
          We've sent a confirmation link to <span className="font-medium">{email}</span>. Follow it to
          activate your account, then log in.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block text-sm font-medium text-hazard hover:text-hazard-light"
        >
          Back to login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your wallet" subtitle="One profile, every document, one link to share">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <FormField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
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
          minLength={6}
          required
        />
        {error && <p className="text-sm text-expired mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-hazard hover:bg-hazard-light text-white font-medium text-sm rounded-md py-2.5 transition disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-charcoal/60 mt-5 text-center">
        Already have a wallet?{' '}
        <Link to="/login" className="text-hazard font-medium hover:text-hazard-light">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
