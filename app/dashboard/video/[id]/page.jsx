'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaCrop, FaText, FaMusic, FaImage, FaWhatsapp } from 'react-icons/fa';
import { MdTimeline, MdUndo, MdRedo } from 'react-icons/md';
import { useParams } from 'next/navigation';
import PlayerDialog from '../../_components/PlayerDialog';
import { VideoData } from '@/configs/schema';
import { Player } from "@remotion/player";
import RemotionVideo from '../../_components/RemotionVideo';
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { PartyPopper, Share2, Facebook, Twitter, Linkedin, Instagram, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"

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
  const [videoId, setVideoId] = useState(params.id);
  const [videoData, setVideoData] = useState();
    const [durationInFrame,setDurationInFrame]=useState(100);
  const [editedContent, setEditedContent] = useState({
    script: [{
      imagePrompt: '',
      contentText: '',
      style: CAPTION_STYLES.DEFAULT
    }]
  });
  const [isPublic, setIsPublic] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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
      setIsPublic(videoData.isPublic || false);
      setShareableUrl(videoData.shareableUrl || '');
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

  const toggleShare = async () => {
    try {
      const response = await fetch('/api/share-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId: params.id, 
          isPublic: !isPublic 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsPublic(data.data.isPublic);
        setShareableUrl(data.data.shareableUrl);
        
        if (!isPublic) {
          navigator.clipboard.writeText(data.data.shareableUrl);
          toast('Share link copied to clipboard!');
        }
        toast(isPublic ? 'Video is now private' : 'Video is now public');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
      toast('Error sharing video');
    }
  };

  const handleSocialShare = (platform) => {
    if (!shareableUrl) {
      toast.error('Please make the video public first');
      return;
    }

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent('Check out this video I created with Cliply AI!')}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`,
      instagram: `https://www.instagram.com/share?url=${encodeURIComponent(shareableUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent('Check out this video I created with Cliply AI! ' + shareableUrl)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      {/* Success Message */}
      <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex items-center gap-3">
              <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <h3 className="text-base sm:text-lg font-semibold text-green-400">Congratulations! 🎉</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {isPublic ? 'Public' : 'Private'}
              </span>
              <Switch
                checked={isPublic}
                onCheckedChange={toggleShare}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Your video has been created successfully! {isPublic ? 'Share it with others using the buttons below.' : 'Make it public to share with others.'}
          </p>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="w-full max-w-md mx-auto p-0 sm:p-4">
        <div className="bg-black rounded-lg overflow-hidden relative">
          <div className='flex justify-center'>
            <div className="relative w-full">
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
                  width: '100%',
                  maxWidth: '100vw',
                  aspectRatio: '9/16',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>
        </div>

        {/* Share Buttons Section */}
        {isPublic && (
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 px-2 sm:px-0">
            <h4 className="text-base sm:text-lg font-semibold text-gray-700">Share Your Video</h4>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white w-full sm:w-auto"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-blue-400 hover:text-white w-full sm:w-auto"
                onClick={() => handleSocialShare('twitter')}
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">X</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-blue-700 hover:text-white w-full sm:w-auto"
                onClick={() => handleSocialShare('linkedin')}
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-pink-600 hover:text-white w-full sm:w-auto"
                onClick={() => handleSocialShare('instagram')}
              >
                <Instagram className="w-4 h-4" />
                <span className="hidden sm:inline">Instagram</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white w-full sm:w-auto"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <FaWhatsapp className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-gray-700 hover:text-white w-full sm:w-auto"
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditVideo;
