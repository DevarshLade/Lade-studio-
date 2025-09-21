'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error occurred:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
        <p className="mt-2 text-gray-600">
          We're sorry, but an unexpected error occurred while loading this page.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={reset}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="flex items-center justify-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 p-4 bg-gray-50 rounded text-left text-sm text-gray-600">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            <pre className="mt-2 text-xs whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
      </div>
    </div>
  )
}