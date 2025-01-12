import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      {/* Logo Section */}
      <div className='mb-8'>
        <Image 
          src='/cliply_logo_no_backgroubd.png'
          alt='Cliply AI' 
          width={180} 
          height={180}
          className='w-auto'
        />
      </div>

      {/* Sign In Form */}
      <div className='w-full max-w-md'>
        <SignIn/>
      </div>
    </div>
  )
}