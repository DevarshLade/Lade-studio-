'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const response = await fetch('/api/env-check')
        const data = await response.json()
        setEnvVars(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch environment variables')
        setLoading(false)
        console.error(err)
      }
    }

    fetchEnvVars()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Checking environment variables...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => key.startsWith('has') && value === false)
    .map(([key]) => key.replace('has', ''))

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Information</h1>
          <p className="text-gray-600 mb-6">
            This page helps diagnose issues with your deployment configuration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables</h2>
              <div className="space-y-3">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className={`px-2 py-1 rounded ${value === 'SET' || value === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis</h2>
              {missingVars.length > 0 ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <h3 className="text-lg font-medium text-red-800">Missing Configuration</h3>
                  <p className="text-red-700 mt-2">
                    The following environment variables are missing:
                  </p>
                  <ul className="list-disc list-inside text-red-700 mt-2">
                    {missingVars.map((varName, index) => (
                      <li key={index}>{varName}</li>
                    ))}
                  </ul>
                  <p className="text-red-700 mt-2">
                    Please add these variables to your Vercel project settings.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <h3 className="text-lg font-medium text-green-800">Configuration Looks Good</h3>
                  <p className="text-green-700 mt-2">
                    All required environment variables are present.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Next Steps</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Check your browser console for JavaScript errors</li>
                  <li>Verify your Clerk domain configuration</li>
                  <li>Ensure your Vercel environment variables match your local .env file</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}