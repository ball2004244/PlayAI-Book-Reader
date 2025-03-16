"use client";
import { useState } from "react";
import { PDFViewer, AudioControl, FileUploader } from "@/app/components";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageText, setPageText] = useState("");

  function handleFileUploaded(fileURL) {
    setPdfFile(fileURL);
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {!pdfFile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Upload a PDF to get started
          </h2>
          <FileUploader onFileUploaded={handleFileUploaded} />
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="pdf-container">
            <PDFViewer
              pdfFile={pdfFile}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              setPageText={setPageText}
            />
          </div>

          <div className="controls-container self-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                Audio Controls
              </h3>
              <AudioControl
                pageText={pageText}
                pdfFile={pdfFile}
                pageNumber={pageNumber}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPdfFile(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Upload a different PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
