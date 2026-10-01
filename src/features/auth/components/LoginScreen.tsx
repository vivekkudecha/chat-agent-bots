import React, { useState } from 'react'
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginUser, clearAuthError } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'

export const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleUseDemo = () => {
    setEmail('admin@example.com')
    setPassword('Admin@123!')
    setLocalError(null)
    dispatch(clearAuthError())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    dispatch(clearAuthError())

    if (!email.trim()) {
      setLocalError('Please enter your email address')
      return
    }

    if (!password) {
      setLocalError('Please enter your password')
      return
    }

    await dispatch(
      loginUser({
        email: email.trim(),
        password,
      })
    )
  }

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-zinc-50/70 p-4 selection:bg-zinc-900 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-zinc-200/50 via-zinc-100/30 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-[390px] animate-in fade-in zoom-in-95 duration-200">
        {/* Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xl shadow-zinc-200/40 p-7">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-11 w-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-md shadow-zinc-950/10 mb-3.5">
              <Bot className="h-6 w-6 text-zinc-100" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
              TataTel AI Copilot
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">
              Sign in to manage custom AI agents and enterprise documents
            </p>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{localError || error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  placeholder="name@tatatel.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (localError) setLocalError(null)
                    if (error) dispatch(clearAuthError())
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white text-zinc-900 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-800">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (localError) setLocalError(null)
                    if (error) dispatch(clearAuthError())
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-white text-zinc-900 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Need quick access?</span>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              disabled={isLoading}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 text-[11px] font-medium text-zinc-700 transition-colors text-center"
            >
              Fill demo: <span className="font-semibold text-zinc-900">admin@example.com</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-400 mt-4">
          Protected by Enterprise Session & RBAC Security
        </p>
      </div>
    </div>
  )
}
