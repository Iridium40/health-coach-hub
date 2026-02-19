import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Verify that the request is authenticated
 * Returns the user if authenticated, or a 401 response if not
 */
export async function verifyAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
  }
  
  return { user, response: null }
}

/**
 * Verify that the request is from an admin user
 * Returns the user if admin, or a 403 response if not
 */
export async function verifyAdmin() {
  const { user, response } = await verifyAuth()
  
  if (response) {
    return { user: null, response }
  }
  
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_role')
    .eq('id', user!.id)
    .single()
  
  const apiRole = profile?.user_role?.toLowerCase()
  if (apiRole !== 'admin' && apiRole !== 'system_admin') {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }
  }
  
  return { user, response: null }
}
