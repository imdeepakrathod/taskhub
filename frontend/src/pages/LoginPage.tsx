import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getAuthErrorMessage } from '../features/auth/api/getAuthErrorMessage'
import { AuthLayout } from '../features/auth/components/AuthLayout'
import { useLogin } from '../features/auth/hooks/useLogin'
import { loginSchema, type LoginFormValues } from '../features/auth/schemas/authSchemas'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
  registrationSuccess?: boolean
  email?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as LoginLocationState | null

  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: locationState?.email ?? '',
      password: '',
    },
  })

  const handleLogin = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)

      const destination = locationState?.from?.pathname ?? '/dashboard'

      navigate(destination, {
        replace: true,
      })
    } catch {
      // Mutation state renders the API error.
    }
  })

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your workspaces."
      footer={
        <p>
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      }
    >
      {locationState?.registrationSuccess ? (
        <div className="auth-alert auth-alert--success" role="status">
          Account created successfully. You can now sign in.
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleLogin} noValidate>
        {loginMutation.error ? (
          <div className="auth-alert auth-alert--error" role="alert">
            {getAuthErrorMessage(loginMutation.error)}
          </div>
        ) : null}

        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
          />

          {errors.email ? (
            <p id="login-email-error" className="auth-field__error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />

          {errors.password ? (
            <p id="login-password-error" className="auth-field__error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button className="auth-submit" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
