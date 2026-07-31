import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'in'|'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = mode==='in' ? await signIn(email,password) : await signUp(email,password,handle);
    if (res.error) setErr(res.error); else nav('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">▶</div>
          <h1 className="text-2xl font-bold">ESTube</h1>
          <p className="text-xs text-gray-500">A project of ESOneWorld</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode==='up' && <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@handle" required className="w-full p-2 rounded border dark:bg-gray-700"/>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 rounded border dark:bg-gray-700"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required className="w-full p-2 rounded border dark:bg-gray-700"/>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded font-semibold">{mode==='in'?'Sign In':'Create Account'}</button>
        </form>
        <button onClick={()=>setMode(mode==='in'?'up':'in')} className="w-full mt-3 text-sm text-blue-500 hover:underline">
          {mode==='in'?'New user? Create account':'Have account? Sign in'}
        </button>
        <p className="mt-4 text-center text-[10px] text-gray-500">© SMART WORLD ORDER • Vision by Dr M Irfan Qadir Thaheem</p>
      </div>
    </div>
  );
}