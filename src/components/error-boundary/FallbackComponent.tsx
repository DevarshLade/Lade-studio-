import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export function FallbackComponent({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-gray-600">
          We're sorry, but an unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onRetry}
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
      </div>
    </div>
  )
}