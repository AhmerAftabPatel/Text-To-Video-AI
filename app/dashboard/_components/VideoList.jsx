import React, { useState } from 'react'
import { Thumbnail } from "@remotion/player";
import RemotionVideo from './RemotionVideo';
import PlayerDialog from './PlayerDialog';

function VideoList({ videoList }) {
    const [openPlayDialog,setOpenPlayerDialog]=useState(false);
    const [videoId,setVideoId]=useState();

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {videoList?.map((video, index) => (
                <div key={video.id} 
                    className='group relative bg-transparent rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300
                    hover:scale-[1.02] cursor-pointer'
                    onClick={() => { setOpenPlayerDialog(Date.now()); setVideoId(video?.id) }}
                >
                    <div className='aspect-[9/16] relative'>
                        <Thumbnail
                            component={RemotionVideo}
                            compositionWidth={250}
                            compositionHeight={390}
                            frameToDisplay={30}
                            durationInFrames={120}
                            fps={30}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            inputProps={{
                                ...video,
                                setDurationInFrame: (v) => console.log(v)
                            }}
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                            <div className='text-white'>
                                {/* <h3 className='font-medium truncate'>{video.title || 'Untitled Video'}</h3> */}
                                {/* <p className='text-sm text-gray-300'>{new Date(video.createdAt).toLocaleDateString()}</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <PlayerDialog playVideo={openPlayDialog} videoId={videoId} />
        </div>
    )
}

export default VideoList