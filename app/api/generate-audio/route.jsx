import { storage } from "@/configs/FirebaseConfig";
import textToSpeech from "@google-cloud/text-to-speech";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextResponse } from "next/server";
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient({
    apiKey:process.env.GOOGLE_API_KEY
});

export async function POST(req) {
    try {
        const { text, id } = await req.json();
        
        const storageRef = ref(storage, 'ai-short-video-files/' + id + '.mp3');
        
        const request = {
            input: { text: text },
            voice: { languageCode: 'en-US', ssmlGender: 'MALE' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        const audioBuffer = Buffer.from(response.audioContent, 'binary');
        
        await uploadBytes(storageRef, audioBuffer, { contentType: 'audio/mp3' });
        const downloadUrl = await getDownloadURL(storageRef);
        
        console.log('Audio generated and uploaded successfully:', downloadUrl);
        return NextResponse.json({ result: downloadUrl });

    } catch (error) {
        console.error('Error in audio generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate or upload audio' },
            { status: 500 }
        );
    }
}