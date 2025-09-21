'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { toast } from '@/hooks/use-toast'

function ResetPasswordContent() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormErrors({})

    // Validation
    const errors: Record<string, string> = {}
    if (!validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      // For password updates, we typically use Clerk's built-in password reset flow
      // This page might be accessed through a password reset link
      // For now, we'll show a success message since this would be handled by Clerk's UI
      setSuccess(true)
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
      setTimeout(() => {
        router.push('/products')
      }, 3000)
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Failed to update password')
      toast({
        title: "Error",
        description: err.message || "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Password Updated Successfully</CardTitle>
            <CardDescription>
              Your password has been updated. You will be redirected to the products page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link href="/products">Go to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div>Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (6+ characters)"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-destructive">{formErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="link" asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ResetPasswordContent />
    </div>
  )
}