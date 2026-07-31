import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users:0, videos:0, views:0, messages:0 });
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*',{count:'exact',head:true}),
      supabase.from('videos').select('*',{count:'exact',head:true}),
      supabase.from('video_events').select('*',{count:'exact',head:true}),
      supabase.from('messages').select('*',{count:'exact',head:true}),
      supabase.from('videos').select('*').order('created_at',{ascending:false}).limit(50),
    ]).then(([u,v,e,m,vid]) => {
      setStats({ users:u.count||0, videos:v.count||0, views:e.count||0, messages:m.count||0 });
      setVideos(vid.data||[]);
    });
  }, []);

  async function deleteVideo(id:string) {
    if (confirm('Delete?')) { await supabase.from('videos').delete().eq('id', id); setVideos(videos.filter(v=>v.id!==id)); }
  }

  if (!user?.is_admin) return <Navigate to="/signin"/>;
  return (
    <div>
      <h1 className="text-3xl font-bold text-red-600 mb-6">👑 ESTube Admin Command & Control</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded"><p className="text-sm">Users</p><p className="text-3xl font-bold">{stats.users}</p></div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded"><p className="text-sm">Videos</p><p className="text-3xl font-bold">{stats.videos}</p></div>
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded"><p className="text-sm">Views</p><p className="text-3xl font-bold">{stats.views}</p></div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded"><p className="text-sm">Messages</p><p className="text-3xl font-bold">{stats.messages}</p></div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">+ Feature Management</h2>
        <p className="text-sm">Password: Daood5577 ✓ | Full control activated</p>
      </div>
      <h2 className="text-xl font-bold mb-3">All Videos</h2>
      <table className="w-full text-sm">
        <thead className="bg-gray-200 dark:bg-gray-700"><tr><th className="p-2 text-left">Title</th><th>Views</th><th>Live</th><th>Action</th></tr></thead>
        <tbody>
          {videos.map(v => (
            <tr key={v.id} className="border-b">
              <td className="p-2">{v.title}</td>
              <td className="text-center">{v.views_count}</td>
              <td className="text-center">{v.is_live?'🔴':'-'}</td>
              <td className="text-center"><button onClick={()=>deleteVideo(v.id)} className="text-red-600">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}