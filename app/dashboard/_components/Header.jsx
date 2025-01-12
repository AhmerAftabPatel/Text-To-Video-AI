import { UserDetailContext } from '@/app/_context/UserDetailContext';
import { Button } from '@/components/ui/button'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import { PanelsTopLeft, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

function Header() {
  const {userDetail, setUserDetail} = useContext(UserDetailContext);
  const router = useRouter();

  return (
    <div className='p-3 px-5 flex items-center fixed w-full justify-between '>
      {/* Left side - Logo and Title */}
      <div className='flex gap-3 items-center'>
        {/* <h2 className='font-bold text-xl text-white'>Cliply AI</h2> */}
        <Image src="/cliply_logo_no_backgroubd.png" width={"100"} height={"100"}/>
      </div>

      {/* Right side - Navigation and User */}
      <div className='flex items-center gap-4'>
        <Button 
          variant="ghost" 
          className="text-black hover:text-white hover:bg-gray-800"
          onClick={() => router.push('/dashboard')}
        >
          <PanelsTopLeft className="w-5 h-5 mr-2" />
          Dashboard
        </Button>

        <SignOutButton>
          <Button 
            variant="ghost" 
            className="text-black hover:text-white hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </SignOutButton>

        <div className='h-8 w-[1px] bg-gray-700'></div>
        <UserButton afterSignOutUrl="/"/>
      </div>
    </div>
  )
}

export default Header