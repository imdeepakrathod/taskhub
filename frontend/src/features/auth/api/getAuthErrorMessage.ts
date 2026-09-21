import axios from 'axios'

type ApiErrorResponse = {
  status?: 'error'
  error?: {
    code?: string
    message?: string
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return 'Unable to connect to the server. Try again.'
    }

    const apiMessage = error.response.data?.error?.message

    if (apiMessage) {
      return apiMessage
    }

    if (error.response.status >= 500) {
      return 'Something went wrong. Try again later.'
    }
  }

  return 'Something went wrong. Try again.'
}
