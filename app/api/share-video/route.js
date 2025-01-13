import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { videoId, isPublic } = await req.json();
    
    // Generate shareable URL if making public
    const shareableUrl = isPublic ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://cliply-ai.netlify.app"}/shared/${videoId}` : null;

    const result = await db.update(VideoData)
      .set({ 
        isPublic: isPublic,
        shareableUrl: shareableUrl
      })
      .where(eq(VideoData.id, videoId))
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error sharing video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share video' }, 
      { status: 500 }
    );
  }
} 