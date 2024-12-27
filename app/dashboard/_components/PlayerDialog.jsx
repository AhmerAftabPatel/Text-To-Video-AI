import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Player } from "@remotion/player";
import RemotionVideo from './RemotionVideo';
import { Button } from '@/components/ui/button';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'next/navigation';

function PlayerDialog({ playVideo, videoId }) {

    const [openDialog, setOpenDialog] = useState(false);
    const [videoData, setVideoData] = useState();
    const [durationInFrame,setDurationInFrame]=useState(100);
  const router=useRouter();

    useEffect(() => {
        videoId&&setOpenDialog(!openDialog)
        videoId && GetVideoData();
    }, [playVideo])

    const GetVideoData = async () => {
        const result = await db.select().from(VideoData)
            .where(eq(VideoData.id, videoId));

        console.log(result);
        setVideoData(result[0]);
    }
    console.log(videoData)

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="bg-white flex flex-col items-center">
                {/* <DialogHeader> */}
                    {/* <DialogTitle className="text-3xl font-bold my-5">Your video is ready</DialogTitle> */}
                    <DialogDescription>
                        <div className='flex gap-4'>
                            <div>
                        <Player
                            component={RemotionVideo}
                            durationInFrames={Number(durationInFrame.toFixed(0))+100} // Added +100 to add extra buffer time
                            compositionWidth={300}
                            compositionHeight={450}
                            fps={30}
                            controls={true}
                            inputProps={{
                                ...videoData,
                                setDurationInFrame:(frameValue)=>setDurationInFrame(frameValue)
                            }}
                            
                        /></div>
                        <div>
                            {videoData?.script.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <h2 className='font-bold text-lg'>Scene {index + 1}</h2>
                                        <p>{item.ContentText}</p>
                                    </div>
                                )
                            })}
                        </div>
                        </div>
                        {/* <div className='flex items-center justify-center'>
                            <Button variant="ghost" onClick={()=>{setOpenDialog(false)}}>
                                Close</Button>

                        </div> */}
                    </DialogDescription>
                {/* </DialogHeader> */}
                <div classname="flex gap-4 justify-center items-center mt-2 w-full">
                            <Button>
                                Share
                            </Button>
                            &nbsp;
                            &nbsp;
                            <Button>
                                Download
                            </Button>
                        </div>
            </DialogContent>
        </Dialog>

    )
}

export default PlayerDialog