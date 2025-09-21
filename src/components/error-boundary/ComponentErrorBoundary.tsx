'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  componentName: string
  onRetry?: () => void
}

interface State {
  hasError: boolean
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Error in {this.props.componentName}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Something went wrong while loading this component. Please try again.
              </p>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}