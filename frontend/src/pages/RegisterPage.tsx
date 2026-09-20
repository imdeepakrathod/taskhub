import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { getAuthErrorMessage } from '../features/auth/api/getAuthErrorMessage'
import { AuthLayout } from '../features/auth/components/AuthLayout'
import { useRegister } from '../features/auth/hooks/useRegister'
import { registerSchema, type RegisterFormValues } from '../features/auth/schemas/authSchemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleRegistration = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values)

      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: true,
          email: values.email.trim().toLowerCase(),
        },
      })
    } catch {
      // Mutation state renders the API error.
    }
  })

  return (
    <AuthLayout
      title="Create your account"
      description="Start managing your projects and tasks in one place."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleRegistration} noValidate>
        {registerMutation.error ? (
          <div className="auth-alert auth-alert--error" role="alert">
            {getAuthErrorMessage(registerMutation.error)}
          </div>
        ) : null}

        <div className="auth-field">
          <label htmlFor="register-name">Full name</label>

          <input
            id="register-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            {...register('name')}
          />

          {errors.name ? (
            <p id="register-name-error" className="auth-field__error">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>

          <input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            {...register('email')}
          />

          {errors.email ? (
            <p id="register-email-error" className="auth-field__error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={
              errors.password ? 'register-password-error' : 'register-password-hint'
            }
            {...register('password')}
          />

          {errors.password ? (
            <p id="register-password-error" className="auth-field__error">
              {errors.password.message}
            </p>
          ) : (
            <p
              id="register-password-hint"
              className="auth-field__error"
              style={{ color: '#64748b' }}
            >
              Use at least 12 characters.
            </p>
          )}
        </div>

        <button className="auth-submit" type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
