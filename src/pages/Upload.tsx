import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Upload() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [res, setRes] = useState('1080p');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file || !user || !title) return alert('Fill all fields');
    setUploading(true);
    const vid = crypto.randomUUID();
    const { data: vdata, error: verr } = await supabase.storage.from('raw-videos').upload(`${vid}/${file.name}`, file, {
      onUploadProgress: (e) => setProgress(Math.round((e.loaded/e.total)*100))
    });
    if (verr) return alert(verr.message);
    let thumbUrl = '';
    if (thumb) {
      await supabase.storage.from('thumbnails').upload(`${vid}/thumb.jpg`, thumb);
      thumbUrl = supabase.storage.from('thumbnails').getPublicUrl(`${vid}/thumb.jpg`).data.publicUrl;
    }
    const videoUrl = supabase.storage.from('raw-videos').getPublicUrl(`${vid}/${file.name}`).data.publicUrl;
    await supabase.from('videos').insert({
      id: vid, channel_id: user.id, title, description: desc,
      video_url: videoUrl, thumbnail_url: thumbUrl, resolution: res, status: 'ready'
    });
    setUploading(false);
    alert('✅ Uploaded!');
    nav('/');
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">⬆ Upload Video (720p - 8K)</h2>
      <input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 mb-3 border rounded dark:bg-gray-700"/>
      <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 mb-3 border rounded dark:bg-gray-700" rows={3}/>
      <select value={res} onChange={e=>setRes(e.target.value)} className="w-full p-2 mb-3 border rounded dark:bg-gray-700">
        <option>720p</option><option>1080p</option><option>1440p</option><option>2160p (4K)</option><option>4320p (8K)</option>
      </select>
      <label className="block mb-3">
        <span className="text-sm">Video File:</span>
        <input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full p-2 border rounded dark:bg-gray-700"/>
      </label>
      <label className="block mb-3">
        <span className="text-sm">Thumbnail:</span>
        <input type="file" accept="image/*" onChange={e=>setThumb(e.target.files?.[0]||null)} className="w-full p-2 border rounded dark:bg-gray-700"/>
      </label>
      {uploading && <div className="mb-3"><div className="w-full bg-gray-200 rounded"><div className="bg-blue-600 text-white text-xs p-1 rounded" style={{width:`${progress}%`}}>{progress}%</div></div></div>}
      <button onClick={handleUpload} disabled={uploading} className="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 disabled:opacity-50">
        {uploading ? 'Uploading...' : '🚀 Upload Video'}
      </button>
    </div>
  );
}