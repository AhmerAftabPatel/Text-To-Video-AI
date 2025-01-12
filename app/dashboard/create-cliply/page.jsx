"use client"
import React, { useContext, useEffect, useState } from 'react'
import SelectTopic from './_components/SelectTopic'
import { Button } from '@/components/ui/button';
import axios from 'axios';
import CustomLoading from './_components/CustomLoading';
import { v4 as uuidv4 } from 'uuid';
import { VideoDataContext } from '@/app/_context/VideoDataContext';
import { db } from '@/configs/db';
import { Users, VideoData } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import PlayerDialog from '../_components/PlayerDialog';
import { UserDetailContext } from '@/app/_context/UserDetailContext';
import { desc, eq } from 'drizzle-orm';
import { toast } from 'sonner';
import EmptyState from '../_components/EmptyState';
import VideoList from '../_components/VideoList';
import VideoSelector from './_components/VideoSelector';
import { useRouter } from 'next/navigation';

function CreateNew() {
  const [formData, setFormData] = useState({
    imageStyle: 'Educational',
    duration: '15 Seconds'

  });
  const [loading, setLoading] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoid] = useState();
  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();
  const [selectedVideos, setSelectedVideos] = useState([]);
  const router = useRouter();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue)
    setFormData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }))
  }

  useEffect(() => {
    user && GetVideoList();
  }, [user])

  useEffect(() => {
    setVideoData(null);// Make Sure it will Null before creating the new Video
  }, [])
  /**
   * Used to Get Users Video
   */
  const GetVideoList = async () => {
    const result = await db.select().from(VideoData)
      .where(eq(VideoData?.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(VideoData.id))
      ;

    console.log(result);
    setVideoList(result);
  }

  const onCreateClickHandler = async () => {
    console.log(userDetail)
    if (userDetail?.credits <= 0) {
      toast("You don't have enough Credits")
      return;
    }
    if (!formData.topic || !formData.imageStyle || !formData.duration) {
      toast("Please fill in all fields")
      return;
    }
    try {
      setLoading(true);
      await GetVideoScript();
    } catch (error) {
      setLoading(false);
      toast("Error creating video");
    }
  }

  const GetVideoScript = async () => {
    const prompt = `Generate a detailed and engaging video script for a duration of "${formData.duration}" seconds on the topic "${formData.topic}". The script should be divided into well-structured scenes, each containing:
- "ContentText": The narration text
- "imagePrompt": Description for AI-generated visuals
- "videoSearchTerm": Short, specific search term for video clips according to the contentText (optional)

Output the result strictly in JSON format as an array of objects. Example:
[
    {
        "ContentText": "Introduction to the topic...",
        "imagePrompt": "A vibrant scene showing...",
        "videoSearchTerm": "business meeting professional",
        "style": "DEFAULT"
    }
]`;

    try {
      const resp = await axios.post('/api/get-video-script', {
        prompt: prompt
      });
      if (resp.data.result) {
        const scriptData = resp.data.result;
        await GenerateAudioFile(scriptData);
      } else {
        throw new Error('Failed to generate script');
      }
    } catch (error) {
      throw new Error('Error generating video script');
    }
  }

  const GenerateAudioFile = async (videoScriptData) => {
    try {
      let script = '';
      const id = uuidv4();
      videoScriptData.forEach(item => {
        script = script + item.ContentText + ' ';
      });

      const resp = await axios.post('/api/generate-audio', {
        text: script,
        id: id
      });
      
      if (resp.data.result) {
        await GenerateAudioCaption(resp.data.result, videoScriptData);
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      throw new Error('Error generating audio');
    }
  }

  const GenerateAudioCaption = async (fileUrl, videoScriptData) => {
    try {
      const resp = await axios.post('/api/generate-caption', {
        audioFileUrl: fileUrl
      });
      
      if (resp.data.result) {
        await GenerateImage(videoScriptData, fileUrl, resp.data.result);
      } else {
        throw new Error('Failed to generate captions');
      }
    } catch (error) {
      throw new Error('Error generating captions');
    }
  }

  const GenerateImage = async (videoScriptData, audioUrl, captions) => {
    let images = [];
    try {
      for (const element of videoScriptData) {
        const resp = await axios.post('/api/generate-image', {
          prompt: element.imagePrompt
        });
        images.push(resp.data.result);
      }
      await FetchVideos(videoScriptData, audioUrl, captions, images);
    } catch (error) {
      throw new Error('Error generating images');
    }
  }

  const FetchVideos = async (videoScriptData, audioUrl, captions, images) => {
    let videos = new Array(videoScriptData.length).fill(null);
    try {
      const videoPromises = videoScriptData.map(async (element, index) => {
        if (element.videoSearchTerm) {
          try {
            const resp = await axios.post('/api/get-video-clips', {
              query: element.videoSearchTerm
            });
            if (resp.data.result?.[0]) {
              videos[index] = resp.data.result[0];
            }
          } catch (error) {
            console.error(`Error fetching video for scene ${index + 1}:`, error);
          }
        }
      });

      await Promise.all(videoPromises);
      
      // Save all data at once
      await SaveVideoData({
        videoScript: videoScriptData,
        audioFileUrl: audioUrl,
        captions: captions,
        imageList: images,
        videoClips: videos
      });
    } catch (error) {
      throw new Error('Error in video creation process');
    }
  }

  const SaveVideoData = async (videoData) => {
    try {
      const result = await db.insert(VideoData).values({
        script: videoData?.videoScript,
        audioFileUrl: videoData?.audioFileUrl ?? '',
        captions: videoData?.captions ?? '',
        imageList: videoData?.imageList ?? [],
        videoClips: videoData?.videoClips ?? [],
        createdBy: user?.primaryEmailAddress?.emailAddress
      }).returning({ id: VideoData?.id });

      await UpdateUserCredits();
      router.push(`/dashboard/video/${result[0].id}`);
    } catch (error) {
      throw new Error('Error saving video data');
    } finally {
      setLoading(false);
    }
  }

  const UpdateUserCredits = async () => {
    try {
      const result = await db.update(Users).set({
        credits: userDetail?.credits - 10
      }).where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));
      setUserDetail(prev => ({
        ...prev,
        "credits": userDetail?.credits - 10
      }))
    } catch (error) {
      toast('Error updating credits')
    }
  }

  const handleVideoSelect = (video) => {
    setSelectedVideos(prev => [...prev, video]);
    setVideoData(prev => ({
        ...prev,
        'videoClips': [...(prev?.videoClips || []), video]
    }));
    toast('Video clip added successfully');
  };

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Hero Section */}
      <div className='text-center mb-6 sm:mb-12 px-4'>
        <h1 className='text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'>
          Create Your Story
        </h1>
        <p className='text-base sm:text-lg text-gray-400 max-w-2xl mx-auto'>
          Transform your ideas into engaging short-form videos in minutes
        </p>
      </div>

      {/* Main Content */}
      <div className='space-y-6 sm:space-y-8 px-2 sm:px-4'>
        {/* Progress Steps */}
        <div className='hidden sm:flex justify-between items-center mb-8 px-4'>
          {['Content', 'Style', 'Duration'].map((step, index) => (
            <div key={step} className='flex items-center'>
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${index < 2 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}
              `}>
                {index + 1}
              </div>
              <div className={`ml-3 text-sm ${index < 2 ? 'text-blue-400' : 'text-gray-400'}`}>
                {step}
              </div>
              {index < 2 && (
                <div className='mx-4 h-0.5 w-24 bg-gray-700'>
                  <div className={`h-full ${index < 2 ? 'bg-blue-500' : ''}`} style={{width: '100%'}}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Creation Form */}
        <div className='grid gap-4 sm:gap-8 md:grid-cols-2'>
          {/* Left Column - Main Controls */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Topic Selection */}
            <div className='bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700'>
              <h3 className='text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4'>What's your topic?</h3>
              <SelectTopic onUserSelect={onHandleInputChange} />
            </div>

            {/* Video Selection */}
            <div className='bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700'>
              <h3 className='text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4'>Add Video Clips</h3>
              <VideoSelector onVideoSelect={handleVideoSelect} />
            </div>

            {/* Duration Control */}
            <div className='bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-base sm:text-lg font-semibold text-white'>Video Duration</h3>
                  <span className='text-blue-400 font-medium'>{formData.duration}s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={formData.duration}
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value);
                    onHandleInputChange('duration', newDuration);
                  }}
                  className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500'
                />
                <div className='flex justify-between text-xs text-gray-400'>
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview and Selected Videos */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Selected Videos Preview */}
            {selectedVideos.length > 0 && (
              <div className='bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700'>
                <h3 className='text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4'>Selected Clips</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  {selectedVideos.map((video, index) => (
                    <div key={index} className='relative rounded-lg overflow-hidden group'>
                      <video 
                        src={video.url}
                        className='w-full aspect-video object-cover'
                        muted
                      />
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <Button
                          variant="destructive"
                          size="sm"
                          className='bg-red-500/80 hover:bg-red-600'
                          onClick={() => {
                            setSelectedVideos(prev => prev.filter((_, i) => i !== index));
                            setVideoData(prev => ({
                              ...prev,
                              'videoClips': prev.videoClips.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credits and Action */}
            <div className='bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700'>
              <div className='flex items-center justify-between mb-4 sm:mb-6'>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-400'>Available Credits</p>
                  <p className='text-xl sm:text-2xl font-bold text-white'>{userDetail?.credits}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-400'>Required Credits</p>
                  <p className='text-xl sm:text-2xl font-bold text-blue-400'>10</p>
                </div>
              </div>
              
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                onClick={onCreateClickHandler}
                disabled={loading || !formData.topic || !formData.imageStyle || !formData.duration}
              >
                {loading ? (
                  <span className='flex items-center gap-2'>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Video...
                  </span>
                ) : 'Create Video'}
              </Button>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className='mt-8 sm:mt-12'>
          {videoList?.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <h3 className='text-xl font-semibold text-white mb-4 sm:mb-6 px-4'>Your Videos</h3>
              <VideoList videoList={videoList} />
            </div>
          )}
        </div>
      </div>

      {/* Loading Modal */}
      {loading && <CustomLoading loading={loading} />}
      
      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );
}

export default CreateNew;