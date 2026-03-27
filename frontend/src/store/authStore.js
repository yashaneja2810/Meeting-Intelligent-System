import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Try to fetch profile from API first
        try {
          const apiUrl = import.meta.env.VITE_API_URL
          
          if (!apiUrl) {
            console.error('VITE_API_URL is not defined')
            // Fallback to direct Supabase query
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            set({ user: session.user, profile, loading: false })
            return
          }

          const response = await fetch(`${apiUrl}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const profile = await response.json()
            set({ user: session.user, profile, loading: false })
          } else {
            console.error('Profile fetch failed:', response.status, response.statusText)
            // Fallback to direct Supabase query
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            set({ user: session.user, profile, loading: false })
          }
        } catch (err) {
          console.error('Profile fetch error:', err)
          // Fallback to direct Supabase query
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            set({ user: session.user, profile, loading: false })
          } catch (supabaseErr) {
            console.error('Supabase profile fetch error:', supabaseErr)
            set({ user: session.user, profile: null, loading: false })
          }
        }
      } else {
        set({ loading: false })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const apiUrl = import.meta.env.VITE_API_URL
            
            if (!apiUrl) {
              // Fallback to direct Supabase query
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({ user: session.user, profile })
              return
            }

            const response = await fetch(`${apiUrl}/users/profile`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const profile = await response.json()
              set({ user: session.user, profile })
            } else {
              // Fallback to direct Supabase query
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({ user: session.user, profile })
            }
          } catch (err) {
            console.error('Profile fetch error:', err)
            // Fallback to direct Supabase query
            try {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({ user: session.user, profile })
            } catch (supabaseErr) {
              console.error('Supabase profile fetch error:', supabaseErr)
              set({ user: session.user, profile: null })
            }
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
