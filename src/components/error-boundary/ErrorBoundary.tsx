'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    
    // Log error information for performance monitoring
    if (typeof window !== 'undefined' && window.performance) {
      console.log('Performance metrics:', {
        navigationStart: window.performance.timing.navigationStart,
        loadEventEnd: window.performance.timing.loadEventEnd,
        domContentLoadedEventEnd: window.performance.timing.domContentLoadedEventEnd,
        // Calculate page load time
        pageLoadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      })
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something went wrong. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                  {this.state.error?.toString()}
                </pre>
              </details>
              <Button 
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.reload()
                }}
                className="w-full"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}