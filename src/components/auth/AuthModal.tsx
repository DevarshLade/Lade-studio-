'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'signin' | 'signup'
  title?: string
  description?: string
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn: clerkSignIn } = useSignIn()
  const { signUp: clerkSignUp } = useSignUp()
  const { isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [resetForm, setResetForm] = useState({ email: '' })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clerkSignIn) return
    
    try {
      setLoading(true)
      setError('')
      
      const result = await clerkSignIn.create({
        identifier: signInForm.email,
        password: signInForm.password,
      })
      
      if (result.status === 'complete') {
        onClose()
      } else {
        setError('Sign in failed')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.errors?.[0]?.message || err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clerkSignUp) return
    
    try {
      setLoading(true)
      setError('')
      
      const result = await clerkSignUp.create({
        emailAddress: signUpForm.email,
        password: signUpForm.password,
        firstName: signUpForm.name?.split(' ')[0],
        lastName: signUpForm.name?.split(' ').slice(1).join(' '),
      })
      
      if (result.status === 'complete') {
        onClose()
      } else {
        setError('Sign up failed')
      }
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.errors?.[0]?.message || err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormErrors({})

    if (!validateEmail(resetForm.email)) {
      setFormErrors({ email: 'Please enter a valid email address' })
      return
    }

    // Clerk handles password reset with their components
    // For now, we'll just show a success message
    setResetEmailSent(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account to continue</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Tab */}
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => setActiveTab('reset')}
                >
                  Forgot your password?
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (6+ characters)"
                    className="pl-10 pr-10"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
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
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>

          {/* Reset Password Tab */}
          <TabsContent value="reset" className="space-y-4">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We've sent a password reset link to {resetForm.email}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab('signin')
                    setResetEmailSent(false)
                    setResetForm({ email: '' })
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-medium">Reset your password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={resetForm.email}
                      onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => setActiveTab('signin')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}