import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Lock } from 'lucide-react';

function VideoSelector({ onVideoSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchVideos = async () => {
        if (!searchQuery) {
            toast("Please enter a search term");
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post('/api/get-video-clips', {
                query: searchQuery
            });
            
            if (response.data.result) {
                setVideos(response.data.result);
            }
        } catch (error) {
            toast('Error fetching videos');
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <p className="text-white">Search for video clips to include in your video</p>
            <div className="flex gap-2">
                <Textarea className="mt-3 text-white"
                    placeholder="Search videos (e.g., nature, business)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button 
                onClick={searchVideos}
                disabled={loading}
            >
                {loading ? 'Searching...' : 'Search'}
            </Button>
            
            {videos.length > 0 && (
                <div className="relative">
                    {/* Video Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 blur-[2px]">
                        {videos.map((video) => (
                            <div 
                                key={video.id}
                                className="relative cursor-pointer hover:opacity-75"
                            >
                                <video 
                                    src={video.url}
                                    className="w-full rounded-lg"
                                    style={{ maxHeight: '200px' }}
                                    muted
                                    onMouseOver={e => e.target.play()}
                                    onMouseOut={e => e.target.pause()}
                                />
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                    {video.duration}s
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Locked Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                        <Lock className="w-12 h-12 text-white mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Feature Coming Soon</h3>
                        <p className="text-gray-300 text-center max-w-md px-4">
                            Video selection feature will be available in the next update.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoSelector; 