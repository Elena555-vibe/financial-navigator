import { createClient, type SupabaseClient } from '@supabase/supabase-js'
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined
export const supabase:SupabaseClient|undefined=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):undefined
export async function ensureAnonymousSession(){ if(!supabase)return null; const {data:{session}}=await supabase.auth.getSession(); if(session)return session; const {data,error}=await supabase.auth.signInAnonymously(); if(error)throw error; return data.session }
