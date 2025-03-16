"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function PDFViewer({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageText, setPageText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    
    if (pdfFile) {
      setPageNumber(1);
    }
  }, [pdfFile]);

  useEffect(() => {
    // Extract text from the current page when page number changes
    if (pdfFile && pageNumber) {
      extractTextFromPage();
    }
  }, [pageNumber, pdfFile]);

  async function extractTextFromPage() {
    if (!pdfFile) return;
    
    try {
      const pdf = await pdfjs.getDocument(pdfFile).promise;
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageText(text);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
    }
  }

  async function speakText() {
    if (!pageText || isSpeaking) return;
    
    setIsSpeaking(true);
    setShouldContinue(true);
    
    try {
      // Split text into manageable chunks (sentences or paragraphs)
      const chunks = pageText.match(/[^\.!\?]+[\.!\?]+/g) || [pageText];
      const MAX_CHUNK_SIZE = 100;
      const processedChunks = [];

      // Combine sentences into chunks that don't exceed MAX_CHUNK_SIZE
      let currentChunk = "";
      for (const sentence of chunks) {
        if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE) {
          processedChunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
      if (currentChunk) processedChunks.push(currentChunk);
  
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => {
          // When one chunk finishes playing, play the next one
          playNextChunk();
        };
      }
  
      let currentIndex = 0;
      
      const playNextChunk = async () => {
        if (!shouldContinue || currentIndex >= processedChunks.length) {
          setIsSpeaking(false);
          return;
        }
        
        const isLastChunk = currentIndex === processedChunks.length - 1;
        
        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              text: processedChunks[currentIndex],
              isLastChunk
            })
          });
          
          if (!response.ok) {
            throw new Error('TTS API request failed');
          }
          
          // Create blob from response and play audio
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Set the new audio source
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          
          // Increment index for the next chunk
          currentIndex++;
          
          // If this is the last chunk, the onended event will stop the speaking
          if (isLastChunk) {
            audioRef.current.onended = () => {
              setIsSpeaking(false);
              setShouldContinue(true);
            };
          }
        } catch (error) {
          console.error("Error processing audio chunk:", error);
          setIsSpeaking(false);
        }
      };
      
      // Start playing the first chunk
      playNextChunk();
      
    } catch (error) {
      console.error("Error with TTS:", error);
      setIsSpeaking(false);
    }
  }
  function stopSpeaking() {
    setShouldContinue(false);
  
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current.src = "";
    }
    
    setIsSpeaking(false);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function nextPage() {
    stopSpeaking();
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  }

  function prevPage() {
    stopSpeaking();
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  if (!pdfFile) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
        <p className="text-lg">No PDF uploaded yet</p>
        <p className="text-sm mt-2">Upload a PDF file to start reading</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden w-full max-w-3xl">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="pdf-page"
          />
        </Document>
      </div>

      {numPages && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm">
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="mt-2">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Stop Reading
              </button>
            ) : (
              <button
                onClick={speakText}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Read Aloud
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}