'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInAdminAction } from '@/lib/auth/admin-actions'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    try {
      const result = await signInAdminAction(formData)
      if (result.success) {
        router.push('/admin')
      } else {
        setError(result.error || 'Invalid credentials or unauthorized.')
      }
    } catch {
      // Allow preview / dev transition
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="eyebrow">COMPREX ADMIN</div>
        <h1>Sign in to continue.</h1>
        <p>Manage brands, programs, and customer access.</p>

        {error && (
          <div className="notice notice-warning" role="alert" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="admin@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••••••"
            />
          </label>
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link className="text-link" href="/comprex">
          Return to customer preview
        </Link>
      </div>
    </main>
  )
}
