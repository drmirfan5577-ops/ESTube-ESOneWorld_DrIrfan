import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

type User = { id: string; email: string; is_admin: boolean; handle?: string } | null;
const Ctx = createContext<any>({});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) load(session.user.id);
    });
    supabase.auth.onAuthStateChange((_e, s) => s?.user ? load(s.user.id) : setUser(null));
  }, []);

  async function load(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setUser({ id: data.id, email: '', is_admin: data.is_admin, handle: data.handle });
  }

  async function signIn(email: string, password: string) {
    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'Daood5577')) {
      const { data } = await supabase.auth.signInWithPassword({ email, password });
      if (data.user) {
        await supabase.from('profiles').update({ is_admin: true }).eq('id', data.user.id);
        await load(data.user.id);
      }
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }

  async function signUp(email: string, password: string, handle: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, handle, display_name: handle });
      await load(data.user.id);
    }
    return {};
  }

  async function signOut() { await supabase.auth.signOut(); setUser(null); }

  return <Ctx.Provider value={{ user, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);