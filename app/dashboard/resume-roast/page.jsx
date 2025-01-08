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
import { desc, eq } from 'drizzle-orm';
import { toast } from 'sonner';
import EmptyState from '../_components/EmptyState';
import VideoList from '../_components/VideoList';
import { Upload } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfToText from 'react-pdftotext'
// import pdfParse from 'pdf-parse';

// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

function ResumeRoast() {
  const [formData, setFormData] = useState({
    imageStyle: 'Educational',
    duration: '15 Seconds'

  });
  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [videoScript, setVideoScript] = useState();
  const [audioFileUrl, setAudioFileUrl] = useState();
  const [captions, setCaptions] = useState();
  const [imageList, setImageList] = useState();
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoid] = useState();
  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);

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
      .where(eq(VideoData?.createdBy, user?.primaryEmailAddress?.emailAddress, 'resume-roast'))
      .orderBy(desc(VideoData.id))
      ;

    console.log(result);
    setVideoList(result);
  }

  const onCreateClickHandler = () => {
    console.log(userDetail)
    if (userDetail?.credits <= 0) {
      toast("You don't have enough Credits")
      return;
    }
    if (!formData.topic || !formData.imageStyle || !formData.duration) {
      toast("Please fill in all fields")
      return;
    }
    GetVideoScript();
  }

  // Get Video Script
  const GetVideoScript = async () => {
    setLoading(true)
    const prompt = `Create a comedic video script roasting a resume in a lighthearted, funny way. Use exaggerated humor, relatable corporate buzzwords, and playful jabs at common resume mistakes like overused action verbs, vague accomplishments, or overly inflated skills. Be witty and engaging, ensuring the roast remains humorous but not mean-spirited. End with a funny but useful tip on how to improve the resume. to generate ' ${formData.duration} + video on roasting resume, this is the resume you have to roast: "${formData.topic}" along with AI image prompt in '${formData.imageStyle}' format for each scene and give me result in JSON format with imagePrompt and ContentText as field, No Plain text`
    console.log(prompt)

    try {
      const resp = await axios.post('/api/get-video-script', {
        prompt: prompt
      });
      if (resp.data.result) {
        setVideoData(prev => ({
          ...prev,
          'videoScript': resp.data.result
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
      setVideoData(prev => ({
        ...prev,
        'audioFileUrl': resp.data.result
      }))
      setAudioFileUrl(resp.data.result);
      resp.data.result && await GenerateAudioCaption(resp.data.result, videoScriptData)
    } catch (error) {
      console.log(error)
      toast('Error generating audio')
      setLoading(false)
    }
  }

  const GenerateAudioCaption = async (fileUrl, videoScriptData) => {
    try {
      setLoading(true);
      const resp = await axios.post('/api/generate-caption', {
        audioFileUrl: fileUrl
      })
      setCaptions(resp?.data?.result);
      setVideoData(prev => ({
        ...prev,
        'captions': resp.data.result
      }))
      resp.data.result && await GenerateImage(videoScriptData);
    } catch (error) {
      toast('Error generating captions')
      setLoading(false)
    }
  }

  const GenerateImage = async (videoScriptData) => {
    let images = [];
    try {
      for (const element of videoScriptData) {
        const resp = await axios.post('/api/generate-image', {
          prompt: element.imagePrompt
        });
        console.log(resp.data.result);
        images.push(resp.data.result);
      }
      setVideoData(prev => ({
        ...prev,
        'imageList': images
      }))
      setImageList(images)
      setLoading(false);
    } catch (error) {
      toast('Error generating images')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoData && Object?.keys(videoData)?.length == 4) {
      SaveVideoData(videoData);
    }
  }, [videoData])

  const SaveVideoData = async (videoData) => {
    try {
      setLoading(true)
      const result = await db.insert(VideoData).values({
        script: videoData?.videoScript,
        audioFileUrl: videoData?.audioFileUrl ?? '',
        captions: videoData?.captions ?? '',
        type: 'resume-roast',
        imageList: videoData?.imageList ?? [],
        createdBy: user?.primaryEmailAddress?.emailAddress
      }).returning({ id: VideoData?.id })

      await UpdateUserCredits();
      setVideoid(result[0].id);
      router.push(`/dashboard/video/` + result[0].id)
      // setPlayVideo(true)
      setLoading(false);
    } catch (error) {
      toast('Error saving video data')
      setLoading(false)
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

  function extractText(file) {
    // const file = event.target.files[0]
    pdfToText(file)
        .then(text => onHandleInputChange('topic', text))
        .catch(error => console.error("Failed to extract text from pdf"))
}

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to our API route using axios
      // const response = await axios.post('/api/resumeextract', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   }
      // });
      extractText(file)
      // const { text } = response.data;
      // console.log(text, "text extracted")
      // Process with Gemini
      // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      // const prompt = `Analyze this resume and provide a concise summary highlighting the key professional experiences, skills, and qualifications: ${text}`;

      // const result = await model.generateContent(prompt);
      // const summary = result.response.text();

      // setFormData(prev => ({
      //   ...prev,
      //   topic: summary
      // }));
      
      // toast.success('Resume text extracted successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to extract text from resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-white mb-2'>Roast my resume with AI</h1>
        {/* <p className='text-gray-600'>Transform your ideas into engaging videos</p> */}
      </div>

      <div className=''>
        {/* <div className='flex mb-4 gap-4'>
          <Button
            className="font-semibold"
            onClick={onCreateClickHandler}
            disabled={true}
          >
            Create Course
          </Button>
          <Button
            className="font-semibold"
            onClick={onCreateClickHandler}
            disabled={loading || !formData.topic || !formData.imageStyle || !formData.duration}
          >
            Create Campaign
          </Button>
        </div> */}
        <p className='text-white'>Upload your resume</p>
        <br/>
        <div className="mb-6 text-center">
          <label className="relative group cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handlePdfUpload}
              disabled={isUploading}
            />
            <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <Upload className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
              <span className="text-sm text-gray-600 group-hover:text-blue-500">
                {isUploading ? 'Processing Resume...' : 'Upload Resume (PDF)'}
              </span>
            </div>
          </label>
        </div>

        <div className='space-y-6'>
          {/* Progress indicator */}
          {/* <div className='flex justify-between mb-8'> */}
          {/* <div className='flex items-center'>
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
          </div> */}

          <div className='rounded-lg'>
            <SelectTopic onUserSelect={onHandleInputChange} value={formData?.topic}/>
          </div>

          {/* <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <SelectStyle onUserSelect={onHandleInputChange} />
          </div>

          <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <SelectDuration onUserSelect={onHandleInputChange} />
          </div> */}

          <div className='flex items-center justify-between mt-8'>
            <div className='text-sm text-white'>
              Credits required: 10
              <br />
              Your credits: {userDetail?.credits}
            </div>
            <Button
              className="font-semibold"
              onClick={onCreateClickHandler}
              disabled={loading || !formData.topic || !formData.imageStyle || !formData.duration}
            >
              {loading ? 'Generating Video...' : 'Roast my resume'}
            </Button>
          </div>
        </div>
      </div>
      <div>
        {/* Empty State */}
        {/* {videoList?.length == 0 && <div className='mt-8'>
          <EmptyState />
        </div>} */}

        {/* Video Grid */}
        {videoList?.length > 0 && <div className='mt-6'>
          <VideoList videoList={videoList} />
        </div>}
      </div>

      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-8 max-w-md w-full'>
            <CustomLoading loading={loading} />
          </div>
        </div>
      )}
      {/* <PlayerDialog playVideo={playVideo} videoId={videoId} /> */}
    </div>
  )
}

export default ResumeRoast