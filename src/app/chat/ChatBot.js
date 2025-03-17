"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Establish WebSocket connection on component mount
  useEffect(() => {
    async function setupConnection() {
      try {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("action", "connect");

        const response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to establish connection");
        }

        const data = await response.json();
        if (data.success && data.sessionId) {
          setSessionId(data.sessionId);
          setIsConnected(true);
          setConnectionError(null);
          console.log("Connection established with session ID:", data.sessionId);
        } else {
          throw new Error("Failed to get valid session ID");
        }
      } catch (error) {
        console.error("Connection error:", error);
        setConnectionError(error.message);
        setIsConnected(false);
      } finally {
        setIsProcessing(false);
      }
    }

    setupConnection();

    // Clean up connection on unmount
    return () => {
      if (sessionId) {
        closeConnection();
      }
    };
  }, []);

  async function closeConnection() {
    if (sessionId) {
      try {
        const formData = new FormData();
        formData.append("action", "disconnect");
        formData.append("sessionId", sessionId);

        await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        setSessionId(null);
        setIsConnected(false);
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }

  async function startRecording() {
    if (!isConnected) {
      alert("Connection not established. Please refresh the page.");
      return;
    }

    // Record user's voice and send to backend
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
          alert("Microphone access is required to use this feature.");
          return null;
        });
      if (!stream) return;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/mpeg",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob);
          formData.append("sessionId", sessionId);
          formData.append("action", "speak");

          // Add user message
          const userMessage = {
            text: "Voice message sent",
            isUser: true,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, userMessage]);

          // Send the audio to the server
          const response = await fetch("/api/chat", {
            method: "POST",
            body: formData,
          });

          // Check if response is successful
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Server error");
          }

          // Get response text from header
          const responseText =
            response.headers.get("X-Response-Text") ||
            "Voice response received";

          // Create audio from binary response
          const responseAudioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(responseAudioBlob);
          const audio = new Audio(audioUrl);

          // Add bot message
          const botMessage = {
            text: responseText,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);

          // Play audio
          audio.onended = () => setIsBotSpeaking(false);
          setIsBotSpeaking(true);
          audio.play();
        } catch (error) {
          console.error("Error processing audio:", error);
          setMessages((prev) => [
            ...prev,
            {
              text: "Error: " + error.message,
              isUser: false,
              timestamp: new Date(),
              isError: true,
            },
          ]);
          
          // If we lost connection, try to reconnect
          if (error.message.includes("No active session") || 
              error.message.includes("WebSocket connection is not open")) {
            setIsConnected(false);
            setSessionId(null);
            // Try to reconnect after a delay
            setTimeout(() => {
              // Retry connection
              setupConnection();
            }, 2000);
          }
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // Function to establish connection (can be called if connection is lost)
  async function setupConnection() {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("action", "connect");

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to establish connection");
      }

      const data = await response.json();
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setIsConnected(true);
        setConnectionError(null);
        console.log("Connection established with session ID:", data.sessionId);
      } else {
        throw new Error("Failed to get valid session ID");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
        Voice Assistant
        {isConnected && (
          <span className="ml-2 text-xs text-green-500">Connected</span>
        )}
        {!isConnected && !isProcessing && (
          <span className="ml-2 text-xs text-red-500">Disconnected</span>
        )}
      </h3>

      {connectionError && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-300 text-sm">
          <p>Connection Error: {connectionError}</p>
          <button 
            onClick={setupConnection}
            className="text-xs mt-1 text-red-700 dark:text-red-400 underline hover:no-underline"
          >
            Try reconnecting
          </button>
        </div>
      )}

      <div className="flex flex-col h-[300px]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-center">
                Understand your book better by chatting with our AI assistant.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-center p-3 rounded-lg ${
                  msg.isUser
                    ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                }`}
              >
                {/* Voice message indicator */}
                <div
                  className={`mr-2 ${
                    msg.isUser
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {msg.isUser ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  {/* Waveform visualization */}
                  <div className="flex items-center h-6 mb-1 space-x-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${
                          msg.isUser
                            ? "bg-blue-500 dark:bg-blue-400"
                            : "bg-gray-500 dark:bg-gray-400"
                        }`}
                        style={{
                          height: `${Math.max(
                            4,
                            Math.floor(Math.random() * 16)
                          )}px`,
                        }}
                      ></div>
                    ))}
                  </div>

                  <div
                    className={`text-sm ${
                      msg.isUser
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-6 rounded-full shadow-lg transition-all ${
              !isConnected
                ? "bg-gray-400 cursor-not-allowed"
                : isProcessing
                ? "bg-yellow-500 cursor-wait"
                : isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : isBotSpeaking
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isProcessing || isBotSpeaking || !isConnected}
          >
            {isBotSpeaking ? (
              // Bot speaking indicator
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : isRecording ? (
              // Stop recording icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            ) : (
              // Start recording icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>

        {isBotSpeaking && (
          <div className="text-center text-sm text-green-600 dark:text-green-400 mt-2 font-medium flex justify-center items-center">
            <div className="flex items-center space-x-1 mr-1">
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            Assistant is speaking
          </div>
        )}

        {isConnected && (
          <div className="text-xs text-center text-gray-500 mt-2">
            Session ID: {sessionId.substring(0, 8)}...
          </div>
        )}
      </div>
    </div>
  );
}
