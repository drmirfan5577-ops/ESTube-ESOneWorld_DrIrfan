import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('videos').select('*').eq('status','ready').order('published_at',{ascending:false}).limit(24)
      .then(r => setVideos(r.data || []));
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🎬 Recommended</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map(v => (
          <Link key={v.id} to={`/watch/${v.id}`} className="group">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {v.thumbnail_url && <img src={v.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition"/>}
            </div>
            <h3 className="mt-2 font-semibold line-clamp-2">{v.title}</h3>
            <p className="text-sm text-gray-500">{v.views_count} views</p>
          </Link>
        ))}
      </div>
    </div>
  );
}