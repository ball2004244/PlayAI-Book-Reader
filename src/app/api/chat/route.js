import { NextResponse } from "next/server";
import { WebSocket } from "ws";

// Store active WebSocket connections with unique IDs
const activeConnections = new Map();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio");
    const sessionId = formData.get("sessionId");
    const action = formData.get("action") || "speak"; // Default action is speak

    if (!audioBlob && action === "speak") {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    // Handle connection management
    if (action === "connect") {
      // Create a new WebSocket connection
      const wsURL =
        `${process.env.PLAYAI_WS_URL}/${process.env.PLAYAI_AGENT_ID}` ||
        "ws://localhost:3001";
      
      const ws = new WebSocket(wsURL);
      const newSessionId = Date.now().toString();
      
      await new Promise((resolve, reject) => {
        ws.on("open", () => {
          console.log(`WebSocket connected for session ${newSessionId}`);
          
          // Send setup message immediately when connection opens
          ws.send(
            JSON.stringify({
              type: "setup",
              apiKey: process.env.PLAYAI_WS_API_KEY,
              outputFormat: "mp3",
            })
          );
          
          // Store the connection with timeout to clean up idle connections
          activeConnections.set(newSessionId, {
            ws,
            timestamp: Date.now(),
            initialized: false,
          });
          
          resolve();
        });
        
        ws.on("error", (error) => {
          console.error("WebSocket connection error:", error);
          reject(new Error("Failed to establish WebSocket connection"));
        });
        
        ws.on("message", (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.type === "init") {
              const connection = activeConnections.get(newSessionId);
              if (connection) {
                connection.initialized = true;
                activeConnections.set(newSessionId, connection);
                console.log(`Session ${newSessionId} initialized`);
              }
            }
          } catch (error) {
            console.error("Error parsing init message:", error);
          }
        });
      });
      
      return NextResponse.json({
        success: true,
        sessionId: newSessionId,
      });
    } else if (action === "disconnect") {
      // Close the WebSocket connection
      if (sessionId && activeConnections.has(sessionId)) {
        const connection = activeConnections.get(sessionId);
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.close();
        }
        activeConnections.delete(sessionId);
        return NextResponse.json({ success: true, message: "Connection closed" });
      }
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    // For speak action, check if we have an active connection
    if (!sessionId || !activeConnections.has(sessionId)) {
      return NextResponse.json(
        { success: false, error: "No active session found" },
        { status: 400 }
      );
    }

    const connection = activeConnections.get(sessionId);
    const ws = connection.ws;
    
    // Update the timestamp
    connection.timestamp = Date.now();
    activeConnections.set(sessionId, connection);

    if (ws.readyState !== WebSocket.OPEN) {
      return NextResponse.json(
        { success: false, error: "WebSocket connection is not open" },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());
    const base64Audio = audioBuffer.toString("base64");

    // Create a promise for this specific conversation turn
    const turnPromise = new Promise((resolve, reject) => {
      let audioData = null;
      let responseText = "";
      const messageHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());

          if (!connection.initialized && response.type === "init") {
            connection.initialized = true;
            activeConnections.set(sessionId, connection);
            
            // Send the audio data after initialization
            ws.send(
              JSON.stringify({
                type: "audioIn",
                data: base64Audio,
              })
            );
          } else if (response.type === "audioStream") {
            // If this is the first audio chunk or we want to keep collecting chunks
            if (!audioData) {
              audioData = {
                data: response.data,
                format: response.format || "audio/mpeg",
                transcript: responseText,
              };

              if (response.data) {
                ws.removeListener("message", messageHandler);
                resolve(audioData);
              }
            } else {
              // For subsequent chunks, we could append them if needed
              // For now, just use the largest chunk
              if (
                response.data &&
                response.data.length > audioData.data.length
              ) {
                audioData.data = response.data;
                ws.removeListener("message", messageHandler);
                resolve(audioData);
              }
            }
          } else if (response.type === "onAgentTranscript") {
            // Capture the transcript text
            console.log(
              "Agent transcript:",
              response.text || response.transcript || response
            );
            if (response.message) {
              responseText = response.message;
            } else {
              responseText =
                response.text || response.transcript || "Response received";
            }
            // Update transcript in audioData if it exists
            if (audioData) {
              audioData.transcript = responseText;
            }
          } else if (response.type === "error") {
            console.error("WebSocket error:", response.code, response.message);
            ws.removeListener("message", messageHandler);
            reject(new Error(`WebSocket error: ${response.message}`));
          }
        } catch (error) {
          console.error("Error parsing message:", error);
          ws.removeListener("message", messageHandler);
          reject(new Error("Invalid response format"));
        }
      };

      // Add the message handler for this turn
      ws.on("message", messageHandler);

      // If already initialized, send audio directly
      if (connection.initialized) {
        ws.send(
          JSON.stringify({
            type: "audioIn",
            data: base64Audio,
          })
        );
      }
    });

    // Wait for WebSocket response with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("WebSocket timeout")), 30000);
    });

    const audioInfo = await Promise.race([turnPromise, timeoutPromise]);
    const audioData = Buffer.from(audioInfo.data || audioInfo, "base64");
    const contentType = audioInfo.format || "audio/mpeg";

    // Return binary audio data with appropriate headers
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Response-Text": audioInfo.transcript || "Voice response received",
        "X-Session-Id": sessionId,
      },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process audio: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}

// Cleanup function to remove idle connections (could be run on a timer)
export function cleanup() {
  const now = Date.now();
  const idleTimeout = 15 * 60 * 1000; // 15 minutes
  
  for (const [sessionId, connection] of activeConnections.entries()) {
    if (now - connection.timestamp > idleTimeout) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close();
      }
      activeConnections.delete(sessionId);
      console.log(`Cleaned up idle session ${sessionId}`);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000);
}
