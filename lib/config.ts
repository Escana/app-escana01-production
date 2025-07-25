export type Config = {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function getConfig(): Config {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined")
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
  }

  if (!supabaseAnonKey) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

