"use client"
import { Button } from '@/components/ui/button'
import React, { useContext, useEffect, useState } from 'react'
import EmptyState from './_components/EmptyState';
import Link from 'next/link';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema';
import { desc, eq } from 'drizzle-orm';
import { useUser } from '@clerk/nextjs';
import VideoList from './_components/VideoList';
import { VideoDataContext } from '../_context/VideoDataContext';
import { FileText, Video } from 'lucide-react';

function Dashboard() {
  const [videoList,setVideoList]=useState([]);
  const {user}=useUser();
  const {videoData,setVideoData}=useContext(VideoDataContext);
  useEffect(()=>{
    user&&GetVideoList();
  },[user])

  useEffect(()=>{
    setVideoData(null);// Make Sure it will Null before creating the new Video
  },[])
  /**
   * Used to Get Users Video
   */
  const GetVideoList=async()=>{
    const result=await db.select().from(VideoData)
    .where(eq(VideoData?.createdBy,user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(VideoData.id))
    ;

    console.log(result);
    setVideoList(result);
  }

  const features = [
    {
      title: "Resume Roast",
      description: "Get your resume roasted by AI with humor and helpful feedback",
      icon: FileText,
      path: "/dashboard/resume-roast",
      gradient: "from-orange-400 to-rose-400",
      hoverScale: "hover:scale-[1.02]"
    },
    {
      title: "Short Video",
      description: "Create engaging AI-powered short videos in minutes",
      icon: Video,
      path: "/dashboard/create-cliply",
      gradient: "from-blue-400 to-violet-400",
      hoverScale: "hover:scale-[1.02]"
    }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-background to-background/80">
      <div className='space-y-8'>
        {/* Header Section */}
        <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center bg-card p-6 rounded-xl shadow-lg'>
          <div>
            <h2 className='font-bold text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>Video Studio</h2>
            <p className='text-muted-foreground mt-1'>Create amazing videos with AI</p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <span>Total Videos: {videoList?.length || 0}</span>
            </div>
            <Link href={'/dashboard/create-cliply'}>
              <Button className="bg-primary hover:bg-primary/90 text-white px-6">
                {/* <span className="mr-2">+</span> */}
                Create
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
          {features.map((feature, index) => (
            <Link 
              href={feature.path} 
              key={index}
              className={`
                group relative overflow-hidden rounded-xl p-8
                bg-gradient-to-r ${feature.gradient}
                transition-all duration-300 ease-out
                ${feature.hoverScale}
                hover:shadow-xl
                cursor-pointer
              `}
            >
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/90">{feature.description}</p>
                
                {/* Subtle arrow indicator */}
                <div className="absolute bottom-4 right-4 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <svg 
                    className="w-6 h-6 text-white"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 8l4 4m0 0l-4 4m4-4H3" 
                    />
                  </svg>
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl transform rotate-45 opacity-50" />
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-2xl transform -rotate-45 opacity-50" />
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {videoList?.length == 0 && <div className='mt-8'>
          <EmptyState />
        </div>}

        {/* Video Grid */}
        {videoList?.length > 0 && <div className='mt-6'>
          <VideoList videoList={videoList} />
        </div>}
      </div>
    </div>
  )
}

export default Dashboard