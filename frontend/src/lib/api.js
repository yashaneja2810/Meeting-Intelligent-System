import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.error('❌ VITE_API_URL is not defined. Please set it in your environment variables.')
} else {
  console.log('✅ API_URL configured:', API_URL)
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
      throw new Error('API_URL is not configured. Please set VITE_API_URL environment variable.')
    }
    const headers = await getAuthHeaders()
    const url = `${API_URL}${endpoint}`
    console.log('API GET:', url)
    
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API GET error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('API returned non-JSON response:', text.substring(0, 200))
      throw new Error('API returned HTML instead of JSON. Check your VITE_API_URL configuration.')
    }
    
    return response.json()
  },

  async post(endpoint, data) {
    if (!API_URL) {
      throw new Error('API_URL is not configured. Please set VITE_API_URL environment variable.')
    }
    const headers = await getAuthHeaders()
    const url = `${API_URL}${endpoint}`
    console.log('API POST:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API POST error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('API returned non-JSON response:', text.substring(0, 200))
      throw new Error('API returned HTML instead of JSON. Check your VITE_API_URL configuration.')
    }
    
    return response.json()
  },

  async put(endpoint, data) {
    if (!API_URL) {
      throw new Error('API_URL is not configured. Please set VITE_API_URL environment variable.')
    }
    const headers = await getAuthHeaders()
    const url = `${API_URL}${endpoint}`
    console.log('API PUT:', url)
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API PUT error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('API returned non-JSON response:', text.substring(0, 200))
      throw new Error('API returned HTML instead of JSON. Check your VITE_API_URL configuration.')
    }
    
    return response.json()
  },

  async delete(endpoint) {
    if (!API_URL) {
      throw new Error('API_URL is not configured. Please set VITE_API_URL environment variable.')
    }
    const headers = await getAuthHeaders()
    const url = `${API_URL}${endpoint}`
    console.log('API DELETE:', url)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API DELETE error:', response.status, errorText)
      throw new Error(errorText || `HTTP ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('API returned non-JSON response:', text.substring(0, 200))
      throw new Error('API returned HTML instead of JSON. Check your VITE_API_URL configuration.')
    }
    
    return response.json()
  }
}
