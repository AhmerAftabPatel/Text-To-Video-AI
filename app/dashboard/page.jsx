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