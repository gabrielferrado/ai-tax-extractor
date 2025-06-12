import { PROMPT_2 } from '@/prompts/PROMPT_2';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger.utils';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function startResumableUpload(file: File): Promise<string | null> {
  logger.info('Starting resumable upload for file:', { name: file.name, type: file.type, size: file.size });
  
  const url = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;

  const headers = {
    "X-Goog-Upload-Protocol": "resumable",
    "X-Goog-Upload-Command": "start",
    "X-Goog-Upload-Header-Content-Length": file.size.toString(),
    "X-Goog-Upload-Header-Content-Type": file.type,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    file: { display_name: file.name },
  });

  const response = await fetch(url, { method: 'POST', headers, body });

  if (response.ok) {
    const uploadUrl = response.headers.get("x-goog-upload-url");
    logger.info('Successfully got upload URL:', { uploadUrl });
    return uploadUrl;
  } else {
    const errorText = await response.text();
    logger.error("Gemini: Failed to start resumable upload", { error: errorText });
    return null;
  }
}

async function uploadFile(uploadUrl: string, file: File, buffer: Buffer): Promise<string | null> {
  logger.info('Uploading file to Gemini:', { uploadUrl, fileType: file.type, bufferSize: buffer.length });
  
  const headers = {
    "Content-Type": file.type,
    "X-Goog-Upload-Command": "upload, finalize",
    "X-Goog-Upload-Offset": "0",
  };

  const response = await fetch(uploadUrl, { method: 'POST', headers, body: buffer });

  if (response.ok) {
    const data = await response.json();
    logger.info('File uploaded successfully, got file URI:', { uri: data?.file?.uri });
    return data?.file?.uri;
  } else {
    const errorText = await response.text();
    logger.error("Gemini: Failed to upload file", { error: errorText });
    return null;
  }
}

async function callGenerateContent(fileUri: string, fileType: string): Promise<string | null> {
  logger.info('Calling Gemini to generate content:', { fileUri, fileType });
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { file_data: { mime_type: fileType, file_uri: fileUri } },
          { text: PROMPT_2 },
        ],
      },
    ],
  });

  const response = await fetch(url, { method: 'POST', headers, body });

  if (response.ok) {
    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    logger.info('Successfully generated content from Gemini:', { 
      hasContent: !!generatedText,
      contentLength: generatedText?.length 
    });
    return generatedText;
  } else {
    const errorText = await response.text();
    logger.error("Gemini: Failed to generate content", { error: errorText });
    return null;
  }
}

// The main API Route handler
export async function POST(req: NextRequest) {
  logger.info('Received summarize request');
  
  if (!GEMINI_API_KEY) {
    logger.error('Gemini API key is not configured');
    return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;

    if (!file) {
      logger.error('No PDF file found in request');
      return NextResponse.json({ error: 'No PDF file found.' }, { status: 400 });
    }

    logger.info('Processing PDF file:', { name: file.name, type: file.type, size: file.size });

    // --- Gemini Upload and Processing Flow ---

    // 1. Start the upload to get a unique URL
    const uploadUrl = await startResumableUpload(file);
    if (!uploadUrl) {
      logger.error('Failed to get upload URL from Gemini');
      return NextResponse.json({ error: "Failed to initiate file upload to Gemini." }, { status: 500 });
    }

    // 2. Upload the file content to the unique URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUri = await uploadFile(uploadUrl, file, buffer);
    if (!fileUri) {
      logger.error('Failed to upload file to Gemini');
      return NextResponse.json({ error: "Failed to upload file to Gemini." }, { status: 500 });
    }

    // 3. Call Gemini with the uploaded file's URI to get the summary
    const summary = await callGenerateContent(fileUri, file.type);
    if (!summary) {
      logger.error('Failed to get summary from Gemini');
      return NextResponse.json({ error: "Failed to generate summary from Gemini." }, { status: 500 });
    }

    // 4. Return the successful summary
    const cleanedSummary = summary.trim().replace(/```json/g, '').replace(/```/g, '');
    logger.info('Successfully processed request, returning summary', { length: cleanedSummary.length });
    return NextResponse.json({ summary: cleanedSummary });
  } catch (error) {
    logger.error('Error in /api/summarize (Gemini):', { error });
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
  }
}