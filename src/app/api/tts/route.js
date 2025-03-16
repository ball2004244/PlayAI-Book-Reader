import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }
;
    const response = await axios({
      method: "post",
      url: `${process.env.PLAYAI_API_URL}/tts/stream`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PLAYAI_API_KEY}`,
        "X-User-Id": `${process.env.PLAYAI_USER_ID}`,
      },
      data: {
        text,
        model: "Play3.0-mini",
        voice: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json",
        format: "mp3"
      },
      responseType: "arraybuffer"
    });

    // Return the audio buffer with proper content type
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "audio/mp3"
      }
    });
  } catch (error) {
    console.error("Error with TTS API:", error);
    console.log("Error details:", error.response?.data);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}