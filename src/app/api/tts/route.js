import axios from "axios";
import { NextResponse } from "next/server";
import { defaultSpeed, defaultTemperature } from "@/app/constants";

export async function POST(request) {
  try {
    const { text, voiceConfig, isChunk, chunkNumber, totalChunks } =
      await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (isChunk) {
      console.log(
        `Processing chunk ${chunkNumber}/${totalChunks} (${text.length} chars)`
      );
    }

    const voice = voiceConfig.value;
    const speed =
      voiceConfig.speed !== undefined ? voiceConfig.speed : defaultSpeed;
    const temperature =
      voiceConfig.temperature !== undefined
        ? voiceConfig.temperature
        : defaultTemperature;

    const response = await axios({
      method: "post",
      url: `${process.env.PLAYAI_API_URL}/tts/stream`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLAYAI_API_KEY}`,
        "X-User-Id": `${process.env.PLAYAI_USER_ID}`,
      },
      data: {
        text,
        model: "Play3.0-mini",
        voice,
        speed,
        temperature,
        format: "mp3",
      },
      responseType: "arraybuffer",
    });

    // Return the audio as a streaming response
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "audio/mp3",
      },
    });
  } catch (error) {
    console.error("Error with TTS API:", error);

    if (error.code === "ECONNABORTED") {
      return NextResponse.json(
        { error: "API request timed out. Try with shorter text." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to generate speech: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
