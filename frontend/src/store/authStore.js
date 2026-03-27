import { create } from 'zustand'
import { supabase } from '@/lib'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Use the API to get profile instead of direct Supabase call
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const profile = await response.json()
            set({ user: session.user, profile, loading: false })
          } else {
            set({ user: session.user, profile: null, loading: false })
          }
        } catch (err) {
          console.error('Profile fetch error:', err)
          set({ user: session.user, profile: null, loading: false })
        }
      } else {
        set({ loading: false })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const profile = await response.json()
              set({ user: session.user, profile })
            } else {
              set({ user: session.user, profile: null })
            }
          } catch (err) {
            console.error('Profile fetch error:', err)
            set({ user: session.user, profile: null })
          }
        } else {
          set({ user: null, profile: null })
        }
      })
    } catch (err) {
      console.error('Initialize error:', err)
      set({ loading: false })
    }
  },

  setProfile: (profile) => set({ profile }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))

// Initialize on load - but only in browser environment
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
