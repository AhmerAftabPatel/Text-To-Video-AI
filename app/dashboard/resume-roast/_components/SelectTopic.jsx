"use client"
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';

  
function SelectTopic({onUserSelect, value = ""}) {
    const options=['Custom Prompt','Random AI Story','Scary Stoy','Historical Facts','Bed Time Story','Motivational','Fun Facts']
    const [selectedOption,setSelectedOption]=useState("Custom Prompt");

    return (
    <div>
        {/* <h2 className='font-bold text-2xl text-primary'>Content</h2> */}
        <p className='text-white'>Or copy paste your resume text.</p>
        {/* <Select onValueChange={(value)=>{
            setSelectedOption(value)
            value!='Custom Prompt'&&onUserSelect('topic',value)
            }}>
            <SelectTrigger className="w-full mt-2 p-6 text-lg">
                <SelectValue placeholder="Content Type" />
            </SelectTrigger>
            <SelectContent>
                {options.map((item,index)=>(
                <SelectItem value={item}>{item}</SelectItem>
                ))}
               
            </SelectContent>
        </Select> */}

        {selectedOption=='Custom Prompt'&&
            <Textarea className="mt-3 text-white"
            onChange={(e)=>onUserSelect('topic',e.target.value)}
            value={value}
            placeholder='Create a educational learning content on learning blockchain technology'/>
        }

    </div>
  )
}

export default SelectTopic