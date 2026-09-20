import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import type { RegisterInput } from '../types'

export function useRegister() {
  const { register } = useAuth()

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  })
}
