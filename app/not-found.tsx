import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="customer-main centered">
      <div className="eyebrow">Page unavailable</div>
      <h1>We couldn&apos;t find that page.</h1>
      <p className="body-copy">The link may be outdated or the program may no longer be available.</p>
      <Link className="btn btn-primary" href="/">Return home</Link>
    </main>
  )
}
