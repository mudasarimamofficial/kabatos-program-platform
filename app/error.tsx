'use client'
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="loading-screen"><h1>Something went wrong</h1><p>We couldn&apos;t load this screen.</p><button className="btn btn-primary" onClick={() => reset()}>Try again</button></main> }
