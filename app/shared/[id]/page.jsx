'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Player } from "@remotion/player";
import RemotionVideo from '../../dashboard/_components/RemotionVideo';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

function SharedVideo() {
  const params = useParams();
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState(null);
  const [durationInFrame, setDurationInFrame] = useState(100);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const result = await db
          .select()
          .from(VideoData)
          .where(
            and(
              eq(VideoData.id, Number(params.id)),
              eq(VideoData.isPublic, true)
            )
          );

        if (result && result[0]) {
          setVideoData(result[0]);
        } else {
          setError('Video not found or is private');
        }
      } catch (err) {
        setError('Error loading video');
        console.error('Error fetching video:', err);
      }
    }

    fetchVideo();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
          <p className="text-gray-400">This video might be private or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center overflow-hidden">
      {/* Container for vertical centering */}
      <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto">
        {/* Responsive container for the video */}
        <div className="w-full max-w-3xl mx-auto">
          {/* Aspect ratio container */}
          <div className="relative w-full h-full">
            <Player
              component={RemotionVideo}
              durationInFrames={Number(durationInFrame.toFixed(0))+100}
              compositionWidth={720}
              compositionHeight={1280}
              fps={30}
              controls={true}
              inputProps={{
                ...videoData,
                setDurationInFrame: (frameValue) => setDurationInFrame(frameValue)
              }}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: 'calc(100vh - 2rem)', // Account for padding
                aspectRatio: '9/16',
                margin: '0 auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedVideo; 