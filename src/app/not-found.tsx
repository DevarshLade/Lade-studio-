import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
          <Search className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="flex items-center justify-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center justify-center gap-2">
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}