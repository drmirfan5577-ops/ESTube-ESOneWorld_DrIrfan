import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Messages() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<File | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('*').neq('id', user?.id).then(r => setUsers(r.data || []));
  }, [user]);

  useEffect(() => {
    if (!selected || !user) return;
    supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selected}),and(sender_id.eq.${selected},receiver_id.eq.${user.id})`)
      .order('created_at').then(r => setMessages(r.data || []));
    const ch = supabase.channel(`chat:${[user.id,selected].sort().join('-')}`)
      .on('broadcast', { event: 'msg' }, ({ payload }) => setMessages(m => [...m, payload]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected, user]);

  async function send() {
    if ((!body && !media) || !user || !selected) return;
    let mediaUrl = '';
    if (media) {
      const path = `${Date.now()}_${media.name}`;
      await supabase.storage.from('messages').upload(path, media);
      mediaUrl = supabase.storage.from('messages').getPublicUrl(path).data.publicUrl;
    }
    const msg = { sender_id: user.id, receiver_id: selected, body, media_type: media?.type.split('/')[0], media_url: mediaUrl };
    await supabase.from('messages').insert(msg);
    supabase.channel(`chat:${[user.id,selected].sort().join('-')}`).send({ type: 'broadcast', event: 'msg', payload: msg });
    setBody(''); setMedia(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[70vh]">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-y-auto">
        <h3 className="font-bold mb-2">Contacts</h3>
        {users.map(u => (
          <div key={u.id} onClick={()=>setSelected(u.id)} className={`p-2 rounded cursor-pointer mb-1 ${selected===u.id?'bg-blue-600 text-white':'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {u.display_name || u.handle}
          </div>
        ))}
      </div>
      <div className="md:col-span-3 flex flex-col bg-white dark:bg-gray-900 rounded border">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(m => (
            <div key={m.id || Math.random()} className={`mb-2 ${m.sender_id===user?.id?'text-right':''}`}>
              <div className={`inline-block p-2 rounded ${m.sender_id===user?.id?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'}`}>
                {m.body}
                {m.media_url && m.media_type==='image' && <img src={m.media_url} className="max-w-xs mt-1 rounded"/>}
                {m.media_url && m.media_type==='audio' && <audio src={m.media_url} controls className="mt-1"/>}
                {m.media_url && m.media_type==='video' && <video src={m.media_url} controls className="max-w-xs mt-1 rounded"/>}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex gap-2">
          <input type="file" onChange={e=>setMedia(e.target.files?.[0]||null)} className="text-sm"/>
          <input value={body} onChange={e=>setBody(e.target.value)} placeholder="Type message..." className="flex-1 p-2 border rounded dark:bg-gray-700"/>
          <button onClick={send} className="px-4 bg-green-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}