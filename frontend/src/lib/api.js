import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

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
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, { headers })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  },

  async post(endpoint, data) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  },

  async put(endpoint, data) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  },

  async delete(endpoint) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }
}
