import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('pdf');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const pdfText = pdfData.text;
    console.log(pdfText, "pdfText")

    // Use Gemini to process and summarize the text
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this resume and provide a concise summary highlighting the key professional experiences, skills, and qualifications: ${pdfText}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ text: summary });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
} 