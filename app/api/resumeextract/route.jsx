import { NextResponse } from 'next/server';
import pdfToText from 'react-pdftotext'

export async function POST(req) {
    try {
        console.log("started api")
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // const pdfData = await pdfParse(buffer);
        
        return NextResponse.json({ 
            text:  ""
            // text: pdfData.text 
        });
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return NextResponse.json(
            { error: 'Failed to parse PDF' },
            { status: 500 }
        );
    }
} 