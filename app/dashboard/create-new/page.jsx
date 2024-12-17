"use client"
import React, { useContext, useEffect, useState } from 'react'
import SelectTopic from './_components/SelectTopic'
import SelectStyle from './_components/SelectStyle';
import SelectDuration from './_components/SelectDuration';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import CustomLoading from './_components/CustomLoading';
import { v4 as uuidv4 } from 'uuid';
import { VideoDataContext } from '@/app/_context/VideoDataContext';
import { db } from '@/configs/db';
import { Users, VideoData } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import PlayerDialog from '../_components/PlayerDialog';
import { useRouter } from 'next/navigation';
import { UserDetailContext } from '@/app/_context/UserDetailContext';
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';

function CreateNew() {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoScript, setVideoScript] = useState();
  const [audioFileUrl, setAudioFileUrl] = useState();
  const [captions, setCaptions] = useState();
  const [imageList, setImageList] = useState();
  const [playVideo,setPlayVideo]=useState(false);
  const [videoId,setVideoid]=useState();
  const {videoData,setVideoData}=useContext(VideoDataContext);
  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  const {user}=useUser();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue)
    setFormData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }))
  }

  const onCreateClickHandler = () => {
    console.log(userDetail)
    if(userDetail?.credits<=0) {
      toast("You don't have enough Credits")
      return;
    }
    if(!formData.topic || !formData.imageStyle || !formData.duration) {
      toast("Please fill in all fields")
      return;
    }
    GetVideoScript();
  }

  // Get Video Script
  const GetVideoScript = async () => {
    setLoading(true)
    const prompt = 'Write a script to generate ' + formData.duration + ' video on topic : ' + formData.topic + ' along with AI image prompt in ' + formData.imageStyle + ' format for each scene and give me result in JSON format with imagePrompt and ContentText as field, No Plain text'
    console.log(prompt)

    try {
      const resp = await axios.post('/api/get-video-script', {
        prompt: prompt
      });
      if (resp.data.result) {
        setVideoData(prev=>({
          ...prev,
          'videoScript':resp.data.result
        }))
        setVideoScript(resp.data.result);
        await GenerateAudioFile(resp.data.result)
      } else {
        toast('Server Side Error: Refresh screen and Try again')
        setLoading(false)
      }
    } catch (error) {
      toast('Error generating video script')
      setLoading(false)
    }
  }

  const GenerateAudioFile = async (videoScriptData) => {
    try {
      let script = '';
      const id = uuidv4();
      videoScriptData.forEach(item => {
        script = script + item.ContentText + ' ';
      })

      const resp = await axios.post('/api/generate-audio', {
        text: script,
        id: id
      });
      setVideoData(prev=>({
        ...prev,
        'audioFileUrl':resp.data.result
      }))
      setAudioFileUrl(resp.data.result);
      resp.data.result && await GenerateAudioCaption(resp.data.result,videoScriptData)
    } catch (error) {
      toast('Error generating audio')
      setLoading(false)
    }
  }

  const GenerateAudioCaption = async (fileUrl,videoScriptData) => {
    try {
      setLoading(true);
      const resp = await axios.post('/api/generate-caption', {
        audioFileUrl: fileUrl
      })
      setCaptions(resp?.data?.result);
      setVideoData(prev=>({
        ...prev,
        'captions':resp.data.result
      }))
      resp.data.result && await GenerateImage(videoScriptData);
    } catch (error) {
      toast('Error generating captions')
      setLoading(false)
    }
  }

  const GenerateImage = async(videoScriptData) => {
    let images = [];
    try {
      for(const element of videoScriptData) {
        const resp = await axios.post('/api/generate-image',{
          prompt:element.imagePrompt
        });
        console.log(resp.data.result);
        images.push(resp.data.result);
      }
      setVideoData(prev=>({
        ...prev,
        'imageList':images
      }))
      setImageList(images)
      setLoading(false);
    } catch (error) {
      toast('Error generating images')
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(videoData&&Object?.keys(videoData)?.length==4) {
      SaveVideoData(videoData);
    }
  },[videoData])

  const SaveVideoData=async(videoData)=>{
    try {
      setLoading(true)
      const result=await db.insert(VideoData).values({
        script:videoData?.videoScript,
        audioFileUrl:videoData?.audioFileUrl??'',
        captions:videoData?.captions??'',
        imageList:videoData?.imageList??[],
        createdBy:user?.primaryEmailAddress?.emailAddress
      }).returning({id:VideoData?.id})

      await UpdateUserCredits();
      setVideoid(result[0].id);
      setPlayVideo(true)
      setLoading(false);
    } catch (error) {
      toast('Error saving video data')
      setLoading(false)
    }
  }

  const UpdateUserCredits=async()=>{
    try {
      const result=await db.update(Users).set({
        credits:userDetail?.credits-10
      }).where(eq(Users?.email,user?.primaryEmailAddress?.emailAddress));
      setUserDetail(prev=>({
        ...prev,
        "credits":userDetail?.credits-10
      }))
    } catch (error) {
      toast('Error updating credits')
    }
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-primary mb-2'>Create New Video</h1>
        <p className='text-gray-600'>Transform your ideas into engaging videos</p>
      </div>

      <div className='bg-white rounded-xl shadow-lg p-8'>
        <div className='space-y-6'>
          {/* Progress indicator */}
          <div className='flex justify-between mb-8'>
            <div className='flex items-center'>
              <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center'>1</div>
              <div className='ml-2'>Content</div>
            </div>
            <div className='flex-1 mx-4 mt-4'>
              <div className='h-1 bg-gray-200'>
                <div className='h-1 bg-primary' style={{width: formData.topic ? '33%' : '0%'}}></div>
              </div>
            </div>
            <div className='flex items-center'>
              <div className='w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center'>2</div>
              <div className='ml-2'>Style</div>
            </div>
            <div className='flex-1 mx-4 mt-4'>
              <div className='h-1 bg-gray-200'>
                <div className='h-1 bg-primary' style={{width: formData.imageStyle ? '33%' : '0%'}}></div>
              </div>
            </div>
            <div className='flex items-center'>
              <div className='w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center'>3</div>
              <div className='ml-2'>Duration</div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <SelectTopic onUserSelect={onHandleInputChange} />
          </div>

          <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <SelectStyle onUserSelect={onHandleInputChange} />
          </div>

          <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <SelectDuration onUserSelect={onHandleInputChange} />
          </div>

          <div className='flex items-center justify-between mt-8'>
            <div className='text-sm text-gray-600'>
              Credits required: 10
              <br/>
              Your credits: {userDetail?.credits}
            </div>
            <Button 
              className="px-8 py-6 text-lg font-semibold" 
              onClick={onCreateClickHandler}
              disabled={loading || !formData.topic || !formData.imageStyle || !formData.duration}
            >
              {loading ? 'Generating Video...' : 'Create Video'}
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-8 max-w-md w-full'>
            <CustomLoading loading={loading} />
          </div>
        </div>
      )}
      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  )
}

export default CreateNew