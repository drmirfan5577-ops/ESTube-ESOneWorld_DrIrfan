import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState('');

  useEffect(() => {
    supabase.from('videos').select('*').eq('id', id).single().then(r => {
      setVideo(r.data);
      if (r.data?.hls_url || r.data?.video_url) {
        const v = document.getElementById('player') as HTMLVideoElement;
        const url = r.data.hls_url || r.data.video_url;
        if (v && url.includes('.m3u8') && Hls.isSupported()) {
          const hls = new Hls(); hls.loadSource(url); hls.attachMedia(v);
        } else if (v) v.src = url;
      }
      supabase.from('video_events').insert({ video_id: id, event_type: 'view', viewer_id: user?.id });
    });
    supabase.from('comments').select('*,profiles(handle,display_name)').eq('video_id', id).order('created_at',{ascending:false})
      .then(r => setComments(r.data || []));
  }, [id]);

  async function postComment() {
    if (!body || !user) return;
    await supabase.from('comments').insert({ video_id: id, author_id: user.id, body });
    setBody('');
    const r = await supabase.from('comments').select('*,profiles(handle,display_name)').eq('video_id', id);
    setComments(r.data || []);
  }

  if (!video) return <div>Loading...</div>;
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <video id="player" controls autoPlay className="w-full aspect-video bg-black rounded-lg" />
        <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
        <p className="text-gray-500">{video.views_count} views</p>
        <p className="mt-4">{video.description}</p>
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h3 className="font-bold mb-3">💬 Comments</h3>
          {user && (
            <div className="flex gap-2 mb-4">
              <input value={body} onChange={e=>setBody(e.target.value)} placeholder="Add comment..." className="flex-1 p-2 rounded border dark:bg-gray-700"/>
              <button onClick={postComment} className="px-4 bg-blue-600 text-white rounded">Post</button>
            </div>
          )}
          {comments.map(c => (
            <div key={c.id} className="border-b py-2">
              <p className="text-sm font-semibold">{c.profiles?.display_name || 'User'}</p>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}