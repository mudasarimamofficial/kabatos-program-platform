'use client'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error('CRITICAL CLIENT ERROR:', error)
  return (
    <main className="loading-screen">
      <h1>Something went wrong</h1>
      <p>We couldn&apos;t load this screen.</p>
      <pre style={{ color: 'red', textAlign: 'left', maxWidth: '600px', overflow: 'auto' }}>{error?.message || String(error)}</pre>
      <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </main>
  )
}
