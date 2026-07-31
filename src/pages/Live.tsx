import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Live() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(id || null);
  const [chat, setChat] = useState<{user:string;msg:string}[]>([]);
  const [msg, setMsg] = useState('');

  async function startStream() {
    if (!user) return;
    const sid = crypto.randomUUID();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    await supabase.from('videos').insert({
      id: sid, channel_id: user.id, title: `Live - ${user.handle}`,
      is_live: true, status: 'live', live_stream_url: sid
    });
    setStreamId(sid);
    setStreaming(true);
    const channel = supabase.channel(`live:${sid}`);
    channel.on('broadcast', { event: 'frame' }, () => {}).subscribe();
  }

  async function sendChat() {
    if (!msg || !user || !streamId) return;
    supabase.channel(`live:${streamId}`).send({ type: 'broadcast', event: 'chat', payload: { user: user.handle, msg } });
    setChat([...chat, { user: user.handle, msg }]);
    setMsg('');
  }

  useEffect(() => {
    if (!streamId) return;
    const ch = supabase.channel(`live:${streamId}`)
      .on('broadcast', { event: 'chat' }, ({ payload }) => setChat(c => [...c, payload]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [streamId]);

  if (!streaming) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6"> Start Live Stream</h2>
        <button onClick={startStream} className="px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-bold hover:bg-red-700">
          🎥 Go Live Now
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <video ref={videoRef} autoPlay muted className="w-full aspect-video bg-black rounded-lg" />
        <p className="mt-2 text-red-600 font-bold">● LIVE • {streamId}</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded h-[500px] flex flex-col">
        <h3 className="font-bold mb-2">💬 Live Chat</h3>
        <div className="flex-1 overflow-y-auto">
          {chat.map((c,i) => <div key={i} className="text-sm mb-1"><b>{c.user}:</b> {c.msg}</div>)}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 p-2 border rounded dark:bg-gray-700"/>
          <button onClick={sendChat} className="px-4 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}