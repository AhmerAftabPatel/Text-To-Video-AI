"use client"
import React, { useEffect, useState } from 'react'
import Header from './_components/Header'
import SideNav from './_components/SideNav'
import { VideoDataContext } from '../_context/VideoDataContext'
import { UserDetailContext } from '../_context/UserDetailContext'
import { useUser } from '@clerk/nextjs'
import { db } from '@/configs/db'
import { Users } from '@/configs/schema'
import { eq } from 'drizzle-orm'

function DashboardLayout({ children }) {
  const [videoData, setVideoData] = useState([]);
  const [userDetail, setUserDetail] = useState([]);
  const {user}=useUser();

  useEffect(()=>{
    user&&getUserDetail();
  },[user])

  const getUserDetail=async()=>{
    const result=await db.select().from(Users)
    .where(eq(Users.email,user?.primaryEmailAddress?.emailAddress))
    setUserDetail(result[0]);
  }

  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
      <VideoDataContext.Provider value={{ videoData, setVideoData }}>
        <div>
          <div>
            <Header />
            <div className='pt-20 sm:p-10 sm:pt-24'>
              <div className='bg-blue-500 rounded-none sm:rounded-xl py-10' 
                style={{
                  background: "radial-gradient(at 68.5155% 112.605%, rgb(105, 48, 239), rgb(69, 6, 159))"
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </VideoDataContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default DashboardLayout