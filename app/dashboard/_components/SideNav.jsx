"use client"
import { CircleUser, FileVideo, PanelsTopLeft, ShieldPlus, Type, Crop, Music, Image, Timer } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

function SideNav() {
    const MenuOption=[
        {
            id:1,
            name:'Dashboard',
            path:'/dashboard',
            icon:PanelsTopLeft
        },
        {
            id:2,
            name:'Create New',
            path:'/dashboard/create-cliply',
            icon:FileVideo
        },
        {
            id:3,
            name:'Upgrade',
            path:'/upgrade',
            icon:ShieldPlus
        },
        {
            id:4,
            name:'Account',
            path:'/account',
            icon:CircleUser
        }
    ]

    // Add video editing tools when on the edit page
    const EditingTools = [
        {
            id: 5,
            name: 'Text',
            icon: Type
        },
        {
            id: 6,
            name: 'Crop',
            icon: Crop
        },
        {
            id: 7,
            name: 'Audio',
            icon: Music
        },
        {
            id: 8,
            name: 'Image',
            icon: Image
        },
        {
            id: 9,
            name: 'Timeline',
            icon: Timer
        }
    ]

    const path = usePathname();
    const isEditPage = path.includes('/dashboard/video/');

    return (
        <div className='w-64 h-screen shadow-md p-5 z-50' style={{ zIndex: "999999" }}>
            <div className='grid gap-3'>
                {/* Main Menu Options */}
                {MenuOption.map((item,index)=>(
                    <Link href={item.path} key={index}>
                        <div className={`flex items-center gap-3 p-3
                        hover:bg-primary hover:text-white
                        rounded-md cursor-pointer
                        ${path==item.path&&'bg-blue-800 text-white'}
                        `}>
                            <item.icon/>
                            <h2>{item.name}</h2>
                        </div>
                    </Link>
                ))}

                {/* Editing Tools Section - Only show on edit page */}
                {isEditPage && (
                    <>
                        <div className='mt-6 mb-2'>
                            <h3 className='text-sm font-semibold text-gray-400 px-3'>EDITING TOOLS</h3>
                        </div>
                        {EditingTools.map((tool) => (
                            <div 
                                key={tool.id}
                                className='flex items-center gap-3 p-3
                                hover:bg-blue-800 hover:text-white
                                rounded-md cursor-pointer'
                            >
                                <tool.icon size={20}/>
                                <h2>{tool.name}</h2>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default SideNav