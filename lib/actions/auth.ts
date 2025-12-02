import { createClient } from "@/lib/supabase/client"

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) throw authError

  return authData
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error

  return user
}
