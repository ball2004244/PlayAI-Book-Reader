"use client";

import { useState, useEffect, useRef } from "react";

export default function AudioControl({ pageText, pdfFile, pageNumber }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    const cacheKey = `${pdfFile?.name || "pdf"}-page-${pageNumber}`;

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

      // Send the entire text to the API
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: pageText }),
      });

      if (!response.ok) {
        throw new Error("TTS API request failed");
      }

      // Get the audio as a blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL for this page
      audioCache.current[cacheKey] = audioUrl;

      // Set the audio source and play
      audioRef.current.src = audioUrl;
      audioRef.current.play();

      setIsSpeaking(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error with TTS:", error);
    } finally {
      setIsProcessing(false);
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
      {isProcessing ? (
        <button
          disabled
          className="px-4 py-2 bg-yellow-500 text-white rounded-md flex items-center justify-center"
        >
          <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Processing Audio...
        </button>
      ) : isSpeaking ? (
        <div className="flex gap-2">
          <button
            onClick={pauseSpeaking}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Pause
          </button>
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Stop
          </button>
        </div>
      ) : isPaused ? (
        <div className="flex gap-2">
          <button
            onClick={speakText}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Resume
          </button>
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Stop
          </button>
        </div>
      ) : (
        <button
          onClick={speakText}
          disabled={!pageText}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Read Aloud
        </button>
      )}
    </div>
  );
}
