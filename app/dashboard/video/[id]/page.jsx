'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaCrop, FaText, FaMusic, FaImage } from 'react-icons/fa';
import { MdTimeline, MdUndo, MdRedo } from 'react-icons/md';
import { useParams } from 'next/navigation';
import PlayerDialog from '../../_components/PlayerDialog';
import { VideoData } from '@/configs/schema';
import { Player } from "@remotion/player";
import RemotionVideo from '../../_components/RemotionVideo';
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';

const CAPTION_STYLES = {
  DEFAULT: 'default',
  MINIMAL: 'minimal',
  BOLD: 'bold',
  CREATIVE: 'creative',
  SUBTITLE: 'subtitle'
};

const EditVideo = () => {
  const params = useParams();
  const [selectedTool, setSelectedTool] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState(params.id);
  const [timeline, setTimeline] = useState([]);
  const [videoData, setVideoData] = useState();
    const [durationInFrame,setDurationInFrame]=useState(100);
  const [editedContent, setEditedContent] = useState({
    script: [{
      imagePrompt: '',
      contentText: '',
      style: CAPTION_STYLES.DEFAULT
    }]
  });

  useEffect(() => {
    if (videoId) {
      console.log('Video ID:', videoId);
      GetVideoData()
    }
  }, [videoId]);

  useEffect(() => {
    if (videoData) {
      // Initialize form with video data when it's loaded
      setEditedContent({
        script: videoData.script || [{ imagePrompt: '', contentText: '' }]
      });
    }
  }, [videoData]);

  const GetVideoData = async () => {
    const result = await db.select().from(VideoData)
        .where(eq(VideoData.id, videoId));

    console.log(result);
    setVideoData(result[0]);
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleScriptChange = (index, field, value) => {
    setEditedContent(prev => ({
      ...prev,
      script: prev.script.map((item, i) => 
        i === index 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const addScriptItem = () => {
    setEditedContent(prev => ({
      ...prev,
      script: [...prev.script, {
        imagePrompt: '',
        contentText: '',
        style: CAPTION_STYLES.DEFAULT
      }]
    }));
  };

  const removeScriptItem = (index) => {
    if (editedContent.script.length > 1) {  // Keep at least one item
      setEditedContent(prev => ({
        ...prev,
        script: prev.script.filter((_, i) => i !== index)
      }));
    }
  };

  const handleUpdateContent = () => {
    // Will implement API call later
    console.log('Updated content:', editedContent);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Video Editor</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Export Video
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Tools Sidebar - kept at 64px */}
        <div className="w-16 bg-white h-screen border-r">
          <div className="flex flex-col gap-4 p-2">
            <button
              className={`p-3 rounded ${selectedTool === 'text' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedTool('text')}
            >
              {/* <FaText /> */}
            </button>
            <button
              className={`p-3 rounded ${selectedTool === 'crop' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedTool('crop')}
            >
              <FaCrop />
            </button>
            <button
              className={`p-3 rounded ${selectedTool === 'music' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedTool('music')}
            >
              <FaMusic />
            </button>
            <button
              className={`p-3 rounded ${selectedTool === 'image' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedTool('image')}
            >
              <FaImage />
            </button>
          </div>
        </div>

        {/* Main Editor Area - Better proportioned */}
        <div className="w-[480px] p-4">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <div className='flex gap-4 justify-center'>
              <div className="relative">
                <Player
                  component={RemotionVideo}
                  durationInFrames={Number(durationInFrame.toFixed(0))+100}
                  compositionWidth={720}
                  compositionHeight={1280}
                  fps={30}
                  controls={true}
                  inputProps={{
                    ...videoData,
                    setDurationInFrame:(frameValue)=>setDurationInFrame(frameValue)
                  }}
                  style={{
                    width: '270px',    // Adjusted for better visibility
                    height: '480px'    // Maintained 9:16 aspect ratio
                  }}
                />
              </div>
            </div>

            {/* Video Controls - Adjusted positioning */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
              <div className="flex items-center gap-4">
                {/* <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-blue-400"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button> */}
                {/* <div className="flex-1 bg-gray-600 h-1 rounded-full">
                  <div className="bg-blue-500 h-full w-1/3 rounded-full" />
                </div> */}
                {/* <span className="text-white">00:00 / 03:24</span> */}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4 bg-white p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <MdTimeline className="text-xl" />
              <h3 className="font-semibold">Timeline</h3>
              <div className="flex gap-2 ml-auto">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <MdUndo />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <MdRedo />
                </button>
              </div>
            </div>
            <div className="h-24 border rounded-lg bg-gray-50">
              {/* Timeline tracks will go here */}
            </div>
          </div>
        </div>

        {/* Properties Panel - Fixed header and footer, scrollable content */}
        <div className="flex-1 bg-white border-l flex flex-col h-screen">
          {/* Fixed Header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold">Properties</h3>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 is important for nested flex scroll */}
            {/* Script Header - Fixed */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Script Content</h3>
                <button
                  onClick={addScriptItem}
                  className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Add Scene
                </button>
              </div>
            </div>

            {/* Scrollable Script Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {editedContent.script.map((item, index) => (
                  <div key={index} className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-gray-700">Scene {index + 1}</h4>
                        {editedContent.script.length > 1 && (
                          <button
                            onClick={() => removeScriptItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Scene Content */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Text
                          </label>
                          <textarea
                            value={item.contentText}
                            onChange={(e) => handleScriptChange(index, 'contentText', e.target.value)}
                            className="w-full h-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter content text..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Caption Style
                          </label>
                          <select
                            value={item.style || CAPTION_STYLES.DEFAULT}
                            onChange={(e) => handleScriptChange(index, 'style', e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={CAPTION_STYLES.DEFAULT}>Default Style</option>
                            <option value={CAPTION_STYLES.MINIMAL}>Minimal</option>
                            <option value={CAPTION_STYLES.BOLD}>Bold</option>
                            <option value={CAPTION_STYLES.CREATIVE}>Creative</option>
                            <option value={CAPTION_STYLES.SUBTITLE}>Subtitle</option>
                          </select>
                          
                          {/* Style Preview */}
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <div className={`text-sm ${
                              item.style === CAPTION_STYLES.BOLD 
                                ? 'font-bold text-lg'
                                : item.style === CAPTION_STYLES.CREATIVE
                                ? 'font-serif italic'
                                : item.style === CAPTION_STYLES.MINIMAL
                                ? 'text-sm font-light'
                                : item.style === CAPTION_STYLES.SUBTITLE
                                ? 'font-mono text-sm'
                                : 'font-normal'
                            }`}>
                              Style Preview: {item.contentText || 'Your text will appear like this'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Prompt
                          </label>
                          <textarea
                            value={item.imagePrompt}
                            onChange={(e) => handleScriptChange(index, 'imagePrompt', e.target.value)}
                            className="w-full h-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter image prompt..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-4 border-t">
              <button
                onClick={handleUpdateContent}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                disabled={!editedContent.script.some(item => item.contentText && item.imagePrompt)}
              >
                Update Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditVideo;
