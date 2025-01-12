import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { query } = await req.json();
        const response = await fetch(
            `https://api.pexels.com/videos/search?query=${query}&per_page=5&orientation=portrait`,
            {
                headers: {
                    Authorization: process.env.PEXELS_API_KEY,
                },
            }
        );

        const data = await response.json();
        // Get the video files with specific height/width requirements
        const processedVideos = data.videos.map(video => {
            const videoFile = video.video_files.find(
                file => file.width === 1080 || file.height === 1920
            ) || video.video_files[0];
            
            return {
                id: video.id,
                url: videoFile.link,
                duration: video.duration,
                width: videoFile.width,
                height: videoFile.height
            };
        });

        return NextResponse.json({ result: processedVideos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
} 