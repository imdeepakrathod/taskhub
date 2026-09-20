import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import type { LoginInput } from '../types'

export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
  })
}
