"use client";

import { useState, useEffect, useRef } from "react";
import AudioBtns from "./AudioBtns";
import VoiceConfig from "./VoiceConfig";
import { defaultVoice } from "@/app/constants";

function chunkText(text, maxLength = 500) {
  // Split a text into chunks
  // Split by sentences to avoid cutting in the middle of a sentence
  const sentences = text.match(/[^.!?]+[.!?]+|\s*\n\s*|\s*$/g) || [];

  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export default function AudioControl({ pageText, pdfFile, pageNumber }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState(defaultVoice);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceTemperature, setVoiceTemperature] = useState(null);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 }); // Add progress tracking

  const audioRef = useRef(null);
  // Cache to store audio URLs for each page
  const audioCache = useRef({});

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all cached URLs when the component unmounts
      Object.values(audioCache.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // Reset audio state when PDF file changes
  useEffect(() => {
    if (pdfFile) {
      // Clear audio cache when loading a new PDF
      audioCache.current = {};
      stopSpeaking();
    }
  }, [pdfFile]);

  // Stop speaking when page changes
  useEffect(() => {
    stopSpeaking();
  }, [pageNumber]);

  async function speakText() {
    if (!pageText || (isSpeaking && !isPaused) || isProcessing) return;

    // If audio is paused, resume playback
    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
    }

    // Create a unique key for this page's text
    const cacheKey = `${pdfFile?.name || "pdf"}-page-${pageNumber}-voice-${
      voiceConfig.name
    }`;

    // Check if we already have audio for this page
    if (audioCache.current[cacheKey]) {
      console.log("Using cached audio for page", pageNumber);
      audioRef.current.src = audioCache.current[cacheKey];
      audioRef.current.play();
      setIsSpeaking(true);
      setIsPaused(false);
      return;
    }

    try {
      setIsProcessing(true);

      // Split text into smaller chunks that can be processed within the 10s limit
      const textChunks = chunkText(pageText);
      const audioChunks = [];
      
      // Set total chunks for progress tracking
      setChunkProgress({ current: 0, total: textChunks.length });

      // Process each chunk sequentially
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];

        // Update progress
        setChunkProgress({ current: i + 1, total: textChunks.length });

        // Update processing message to show progress
        setIsProcessing(true);

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: chunk,
            voiceConfig: voiceConfig,
            isChunk: true,
            chunkNumber: i + 1,
            totalChunks: textChunks.length,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(
            `TTS API request failed for chunk ${i + 1}: ${response.statusText}`
          );
        }

        // Get the audio as a blob
        const audioBlob = await response.blob();
        audioChunks.push(audioBlob);
      }

      // Combine all audio chunks into a single audio file
      const combinedBlob = new Blob(audioChunks, { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(combinedBlob);

      // Cache the combined audio URL for this page
      audioCache.current[cacheKey] = audioUrl;

      // Set the audio source and play
      audioRef.current.src = audioUrl;
      audioRef.current.play();

      setIsSpeaking(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error with TTS:", error);
      // Provide user feedback
      alert(
        "There was an error generating audio. Please try again with a smaller text selection."
      );
    } finally {
      setIsProcessing(false);
      setChunkProgress({ current: 0, total: 0 }); // Reset progress
    }
  }

  function pauseSpeaking() {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
    setIsPaused(false);
  }

  return (
    <div className="mt-2">
      <AudioBtns
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        pageText={pageText}
        onPlay={speakText}
        onPause={pauseSpeaking}
        onStop={stopSpeaking}
        progress={chunkProgress}
      />
      <div className="mt-2">
        <VoiceConfig
          onVoiceSelect={(selectedVoiceConfig) => {
            setVoiceConfig(selectedVoiceConfig);
          }}
        />
      </div>
    </div>
  );
}
