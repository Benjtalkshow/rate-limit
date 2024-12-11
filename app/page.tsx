'use client'

import { useState } from 'react'

interface ApiResponse {
  success: boolean
  limit: number
  remaining: number
  message: string
}

export default function Home() {
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callApi = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: ApiResponse = await res.json()
      setResponse(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setResponse(null)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Rate Limited API Example</h1>
        <button 
          onClick={callApi}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        >
          Call API
        </button>
        {response && (
          <div className={`mt-4 p-4 ${response.success ? 'bg-green-100' : 'bg-yellow-100'} rounded`}>
            <h2 className="text-xl font-semibold mb-2">Response:</h2>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Error:</h2>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </main>
  )
}

