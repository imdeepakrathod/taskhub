import type { ReactNode } from 'react'

import './AuthLayout.css'

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-brand__mark" aria-hidden="true">
            T
          </span>

          <span>TaskHub</span>
        </div>

        <header className="auth-header">
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </header>

        {children}

        <footer className="auth-footer">{footer}</footer>
      </section>
    </main>
  )
}
