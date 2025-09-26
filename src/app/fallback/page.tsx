'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

export default function FallbackPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/detailed-debug')
        const data = await response.json()
        setDebugInfo(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch debug information')
        setLoading(false)
        console.error('Debug fetch error:', err)
      }
    }

    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Debug Error</h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const missingRequiredVars = Object.entries(debugInfo.requiredEnvVars)
    .filter(([key, value]: [string, any]) => value.status === 'MISSING')
    .map(([key]) => key)

  const allRequiredVarsPresent = missingRequiredVars.length === 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Diagnostic</h1>
          <p className="text-gray-600 mb-6">
            This page helps diagnose issues with your deployment configuration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{debugInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">{debugInfo.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-medium">{debugInfo.region}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Status</h2>
              <div className="flex items-center">
                {allRequiredVarsPresent ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>All required variables present</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>{missingRequiredVars.length} missing variables</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Environment Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(debugInfo.requiredEnvVars).map(([key, value]: [string, any]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{key}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.includes('CLERK') ? 'Clerk authentication' : 'Supabase database'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      value.status === 'SET' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {value.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {missingRequiredVars.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <h3 className="text-lg font-medium text-red-800">Missing Configuration</h3>
              <p className="text-red-700 mt-2">
                The following environment variables are missing. Please add them to your Vercel project settings:
              </p>
              <ul className="list-disc list-inside text-red-700 mt-2">
                {missingRequiredVars.map((varName, index) => (
                  <li key={index} className="font-mono">{varName}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button asChild>
                  <a 
                    href="https://vercel.com/docs/concepts/projects/environment-variables" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    Vercel Environment Variables Guide <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/">Try Main Site</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Check your browser console for JavaScript errors (F12)</li>
            <li>Verify all required environment variables are set in Vercel</li>
            <li>Check Vercel deployment logs for build errors</li>
            <li>If using a custom domain, ensure DNS is properly configured</li>
            <li>Check if your Clerk domain configuration matches your production domain</li>
          </ol>
        </div>
      </div>
    </div>
  )
}