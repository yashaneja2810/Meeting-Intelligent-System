import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.warn('VITE_API_URL is not defined. API calls may fail.')
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  }
}

export const api = {
  async get(endpoint) {
    if (!API_URL) {
      throw new Error('API_URL is not configured')
    }
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, { headers })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API GET error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async post(endpoint, data) {
    if (!API_URL) {
      throw new Error('API_URL is not configured')
    }
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API POST error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async put(endpoint, data) {
    if (!API_URL) {
      throw new Error('API_URL is not configured')
    }
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API PUT error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async delete(endpoint) {
    if (!API_URL) {
      throw new Error('API_URL is not configured')
    }
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API DELETE error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    return response.json()
  }
}
