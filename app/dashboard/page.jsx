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
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();
  const { videoData, setVideoData } = useContext(VideoDataContext);

  useEffect(() => {
    user && GetVideoList();
  }, [user])

  useEffect(() => {
    setVideoData(null);
  }, [])

  const GetVideoList = async () => {
    const result = await db.select().from(VideoData)
      .where(eq(VideoData?.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(VideoData.id));
    setVideoList(result);
  }

  const features = [
    {
      title: "Short Video",
      description: "Create engaging AI-powered short videos in minutes",
      icon: Video,
      path: "/dashboard/create-cliply",
      gradient: "from-blue-400 to-violet-400",
    },
    {
      title: "Resume Roast",
      description: "Get your resume roasted by AI with humor and helpful feedback",
      icon: FileText,
      path: "/dashboard/resume-roast",
      gradient: "from-orange-400 to-rose-400",
    },
  ];

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Main Content */}
      <div className="p-2 sm:p-6 max-w-7xl mx-auto">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {features.map((feature, index) => (
            <Link 
              href={feature.path} 
              key={index}
              className={`
                relative overflow-hidden rounded-xl p-4 sm:p-6
                bg-gradient-to-r ${feature.gradient}
                transition-all duration-300
                hover:shadow-lg
                group
              `}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/90">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Videos Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-white">
                Recent Videos
              </h2>
              <p className="text-sm sm:text-base text-white dark:text-gray-400">
                {videoList?.length} videos created
              </p>
            </div>
            <Link href="/dashboard/create-cliply">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-violet-400 text-white hover:opacity-90">
                Create New Video
              </Button>
            </Link>
          </div>

          {/* Video List */}
          {videoList?.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <VideoList videoList={videoList} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;